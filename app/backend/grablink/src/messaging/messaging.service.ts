import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(@Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy) {}

  async publishShareEvent(payload: { code: string; url: string; createdAt: string }): Promise<void> {
    this.logger.log(`Publishing share event for code ${payload.code}`);
    await this.client.connect();
    await lastValueFrom(this.client.emit('share.created', payload));
  }
}
