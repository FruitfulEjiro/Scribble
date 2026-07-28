import { Module } from '@nestjs/common';
import { CronService } from './cron.service';

@Module({
  imports: [],
  exports: [CronService],
  providers: [CronService],
  controllers: [],
})
export class CronModule {}
