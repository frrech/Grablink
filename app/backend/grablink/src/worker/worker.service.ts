import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from '../share/entities/share.entity';

@Controller()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);

  constructor(@InjectRepository(Share) private readonly shareRepository: Repository<Share>) {}

  @EventPattern('share.created')
  async handleShareCreated(@Payload() data: { code: string; url: string; createdAt: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Received share.created event for code ${data.code}`);

      const share = await this.shareRepository.findOne({ where: { code: data.code } });
      if (!share) {
        this.logger.warn(`Share not found for code ${data.code}`);
        channel.ack(originalMsg);
        return;
      }

      // In a real app, this can call a URL enrichment service or Lambda
      share.processed = true;
      await this.shareRepository.save(share);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Failed to process share event for code ${data.code}`, error as Error);
      channel.nack(originalMsg, false, false);
    }
  }
}
