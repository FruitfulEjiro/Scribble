import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import IUser from 'src/user/interface/user.interface';
import * as crypto from 'crypto';
import EmailService from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    private readonly email: EmailService,
  ) {}

  async register(data: Prisma.UserCreateInput): Promise<IUser> {
    const [existingUser, existingUsername] = await Promise.all([
      this.prisma.user.findUnique({
        where: { email: data.email },
      }),
      this.prisma.user.findUnique({
        where: { username: data.username },
      }),
    ]);
    if (existingUser)
      throw new ConflictException('user with email already exists');
    if (existingUsername)
      throw new ConflictException('username already exists');

    const hashedPassword = await this.hashPassword(data.password!);

    const user = await this.prisma.user.create({
      data: {
        firstname: data.firstname!,
        lastname: data.lastname!,
        username: data.username!,
        email: data.email!,
        password: hashedPassword!,
      },
    });
    if (!user) throw new InternalServerErrorException('failed to create post');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    await this.email.sendWelcomeMail(user.email);

    const modUser = this.sanitizeUserObj(user);
    return {
      ...modUser,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginDto): Promise<IUser> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user || !(await this.verifyPassword(data.password, user.password)))
      throw new NotFoundException('invalid email or password');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const modUser = this.sanitizeUserObj(user);
    return {
      ...modUser,
      accessToken,
      refreshToken,
    };
  }

  async updatePassword(
    userId: string,
    password: string,
    newPassword: string,
  ): Promise<IUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('user doesnt exist');

    if (!this.verifyPassword(password, user.password))
      throw new ForbiddenException('current password isnt correct');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: await this.hashPassword(newPassword) },
    });
    if (!updatedUser) throw new NotFoundException('user not found');

    return <IUser>this.sanitizeUserObj(updatedUser);
  }

  async forgotPassword(email: string): Promise<{}> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('user not found');

    const resetLink = await this.generateResetLink({
      id: user.id,
      email: user.email,
    });

    // send code to user email
    // -----------------

    return { message: 'password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{}> {
    const payload = this.verifyResetToken(token);
    if (!payload) throw new BadRequestException('token is invalid');

    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) throw new NotFoundException('user not found');

    await this.prisma.user.update({
      where: { email: payload.email },
      data: { password: await this.hashPassword(newPassword) },
    });

    return { message: 'password reset successful' };
  }

  async logout(userId: string): Promise<{}> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('user not found');

    this.generateAccessToken(user);
    this.generateRefreshToken(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: null,
      },
    });

    return { message: 'logged out successfully' };
  }

  private async hashPassword(password: string) {
    try {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (err) {
      console.log(err);
    }
  }

  private async verifyPassword(password: string, dbPassword: string) {
    try {
      return await bcrypt.compare(password, dbPassword);
    } catch (err) {
      console.log(err);
    }
  }

  private sanitizeUserObj(user: any) {
    const {
      password,
      refreshToken,
      passwordResetToken,
      passwordResetTokenExpiresAt,
      passwordChangedAt,
      ...result
    } = user;
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

  private generateResetLink(payload: { id: string; email: string }): string {
    const token = this.jwt.sign(payload, {
      expiresIn: this.configService.get<string>('resetTokenExpiresIn'),
    });

    const resetLink = `${this.configService.get<string>('frontendUrl')}/reset-password?token=${token}`;
    return resetLink;
  }

  private verifyResetToken(token: string): {
    id: string;
    email: string;
  } {
    const payload = this.jwt.verify(token);
    return payload;
  }
}
