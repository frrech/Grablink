import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CreateShareDto } from './dto/create-share.dto';
import { Share } from './entities/share.entity';

@Injectable()
export class ShareService {
  private readonly logger = new Logger(ShareService.name);

  constructor(@InjectRepository(Share) private shareRepository: Repository<Share>) {}

  /**
   * Generate a random 6-digit code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create a new share link
   */
  async createShare(createShareDto: CreateShareDto): Promise<Share> {
    let code: string = '';
    let isUnique = false;
    let attempts = 0;

    // Generate unique code
    while (!isUnique && attempts < 10) {
      code = this.generateCode();
      const existing = await this.shareRepository.findOne({ where: { code } });
      isUnique = !existing;
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('Failed to generate unique code');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    const share = this.shareRepository.create({
      code,
      url: createShareDto.url,
      createdAt: now,
      expiresAt,
      processed: false,
      accessCount: 0,
    });

    const saved = await this.shareRepository.save(share);

    // Log the share creation
    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        event: 'code_generated',
        code: code,
        url: createShareDto.url,
      }),
    );

    // TODO: Publish message to SQS for Lambda processing
    // this.messagingService.publishShareEvent(share);

    return saved;
  }

  /**
   * Access a share link by code
   */
  async accessShare(code: string): Promise<Share> {
    const share = await this.shareRepository.findOne({ where: { code } });

    if (!share) {
      throw new NotFoundException(`Share code not found: ${code}`);
    }

    // Check if expired
    if (new Date() > share.expiresAt) {
      this.logger.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'WARN',
          event: 'expired_code_access',
          code: code,
        }),
      );
      throw new BadRequestException(`Share code has expired`);
    }

    // Increment access count
    share.accessCount += 1;
    await this.shareRepository.save(share);

    // Log the access
    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        event: 'code_accessed',
        code: code,
        title: share.title || 'pending',
        processed: share.processed,
      }),
    );

    return share;
  }

  /**
   * Update share with processed data (called by Lambda)
   */
  async updateShareWithMetadata(code: string, title: string): Promise<void> {
    const share = await this.shareRepository.findOne({ where: { code } });

    if (!share) {
      this.logger.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'WARN',
          event: 'metadata_update_failed',
          code: code,
          reason: 'Code not found',
        }),
      );
      return;
    }

    share.title = title;
    share.processed = true;
    await this.shareRepository.save(share);

    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        event: 'url_enriched',
        code: code,
        title: title,
        execution_time_ms: 150,
      }),
    );
  }

  /**
   * Get all shares (for monitoring/debugging)
   */
  async getAllShares(): Promise<Share[]> {
    return this.shareRepository.find();
  }

  /**
   * Clean up expired shares
   */
  async cleanupExpiredShares(): Promise<void> {
    const now = new Date();

    const expiredShares = await this.shareRepository.find({
      where: { expiresAt: LessThan(now) },
    });

    if (expiredShares.length > 0) {
      for (const share of expiredShares) {
        this.logger.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            event: 'expired_link_cleanup',
            code: share.code,
            accessed: share.accessCount > 0,
          }),
        );
      }

      // Delete expired shares
      await this.shareRepository.remove(expiredShares);
    }
  }
}
