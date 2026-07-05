import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ShareService } from './share.service';

@Injectable()
export class ShareScheduler {
  private readonly logger = new Logger(ShareScheduler.name);

  constructor(private readonly shareService: ShareService) {}

  /**
   * Clean up expired shares every minute
   */
  @Interval(60 * 1000)
  async handleExpiredShares() {
    this.logger.log('Running cleanup task for expired shares...');
    await this.shareService.cleanupExpiredShares();
  }
}

