import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepo } from './repository/user.repository';

@Module({
  imports: [],
  exports: [UserService],
  providers: [UserService, UserRepo],
  controllers: [UserController],
})
export class UserModule {}
