import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteRepo } from './repository/invite.repository';
import { InviteService } from './invite.service';

@Module({
  imports: [],
  exports: [InviteService],
  providers: [InviteService, InviteRepo],
  controllers: [InviteController],
})
export class InviteModule {}
