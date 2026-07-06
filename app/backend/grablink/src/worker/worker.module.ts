import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Share } from '../share/entities/share.entity';
import { WorkerService } from './worker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Share]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_WORKER_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: process.env.RABBITMQ_QUEUE || 'grablink-share-queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [WorkerService],
})
export class WorkerModule {}
