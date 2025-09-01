import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class UserExistsPipe {
  constructor(private readonly userService: UserService) {}

  async transform(value: string) {
    const user = await this.userService.findUserById(value);
    if (!user)
      throw new NotFoundException(`User with the ID ${value} does not exist.`);
    return value;
  }
}
