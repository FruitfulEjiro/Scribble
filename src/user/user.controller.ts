import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserExistsPipe } from './pipes/user-exists.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import UpdateUserDto from './dto/updata-user.dto';
import { IUser } from './interface/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-user/:id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id', UserExistsPipe) id: string) {
    const user = await this.userService.findUserById(id);
    return user;
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id', UserExistsPipe) id: string,
    @Body() data: UpdateUserDto,
  ): Promise<IUser> {
    const user = await this.userService.updateUser(id, data);
    return user;
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', UserExistsPipe) id: string): Promise<void> {
    return await this.userService.deleteUser(id);
  }
}
