import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PrismaService from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import LoginDto from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/user/interface/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(data: Prisma.UserCreateInput): Promise<IUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser)
      throw new ConflictException('user with email already exists');

    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    });
    if (!user) throw new InternalServerErrorException('failed to create post');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const modUser = this.excludePassword(user)
    return {
      ...modUser,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user || !(await this.verifyPassword(data.password, user.password)))
      throw new NotFoundException('invalid email or password');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const modUser = this.excludePassword(user)
    return {
      ...modUser,
      accessToken,
      refreshToken,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  private async verifyPassword(
    password: string,
    dbPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, dbPassword);
  }

  private excludePassword(user: any) {
    const { password, ...result } = user;
    return result;
  }

  private generateAccessToken(user: IUser): string {
    const payload = {
      email: user.email,
      id: user.id,
      userType: user.userType,
    };

    return this.jwt.sign(payload, {
      secret: this.configService.get<string>('accessTokenSecret'),
      expiresIn: this.configService.get<string>('accessTokenExpiresIn'),
    });
  }

  private generateRefreshToken(user: IUser): string {
    const payload = {
      email: user.email,
      id: user.id,
      userType: user.userType,
    };

    return this.jwt.sign(payload, {
      secret: this.configService.get<string>('refreshTokenSecret'),
      expiresIn: this.configService.get<string>('refreshTokenExpiresIn'),
    });
  }
}
