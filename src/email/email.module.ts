import { Module } from '@nestjs/common';
import EmailService from './email.service';

@Module({
  providers: [EmailService],
  imports: [],
  exports: [EmailService],
})
export class EmailModule {}
