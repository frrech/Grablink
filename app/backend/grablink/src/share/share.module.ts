import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { QrCodeService } from './qr-code.service';
import { ShareScheduler } from './share.scheduler';
import { Share } from './entities/share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Share]), ScheduleModule.forRoot()],
  controllers: [ShareController],
  providers: [ShareService, QrCodeService, ShareScheduler],
  exports: [ShareService],
})
export class ShareModule {}
