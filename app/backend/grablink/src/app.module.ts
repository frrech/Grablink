import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShareModule } from './share/share.module';
import { MessagingModule } from './messaging/messaging.module';
import { getDatabaseConfig } from './database/database.config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    ShareModule,
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics:{
        enabled: true,
      },
    }),
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
