import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserExistsPipe } from './pipes/user-exists.pipe';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-user/:id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id', UserExistsPipe) id: string) {
    const user = await this.userService.findUserById(id);
    return user;
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', UserExistsPipe) id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
