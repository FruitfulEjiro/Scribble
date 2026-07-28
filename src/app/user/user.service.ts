import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserRepo } from './repository/user.repository';
import { UpdateUserDto } from './dtos';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userRepo: UserRepo) {}

  async updateUser(userId: string, data: UpdateUserDto) {
    const userObj: Record<string, any> = {};
    const profileObj: Record<string, any> = {};

    if (data.firstname) userObj.firstname = data.firstname;
    if (data.lastname) userObj.lastname = data.lastname;
    if (data.bio) profileObj.bio = data.bio;
    if (data.location) profileObj.location = data.location;

    const socialLinksPatch = data.socialLinks
      ? Object.fromEntries(
          Object.entries(data.socialLinks).filter(([, v]) => v !== undefined),
        )
      : undefined;

    try {
      await this.userRepo.updateUserAndProfile(
        userId,
        userObj,
        profileObj,
        socialLinksPatch,
      );
      this.logger.log(`user ${userId} updated`);
    } catch (error) {
      this.logger.error(`couldn't update user ${userId}`, error);
      throw new InternalServerErrorException("couldn't update user");
    }

    return this.userRepo.getUserWithProfile(userId);
  }

  async updateUsername(id: string, username: string) {
    const checkUsername = await this.userRepo.findOne({ username });
    if (checkUsername) throw new BadRequestException('username already exists');

    await this.userRepo.update(id, { username });

    return { username };
  }

  async checkUsername(username: string) {
    const user = await this.userRepo.findOne({ username });
    return { isAvailable: !user };
  }
}
