import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthHelper } from '../helper';
import { PrismaService } from 'src/lib/database';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(
    private readonly helper: AuthHelper,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // return true if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    // 1. get token from cookie
    const token = request.cookies?.access_token;
    if (!token) {
      throw new UnauthorizedException('Pls login');
    }
    try {
      // 2. verify token
      const payload = await this.helper.verifyAccessToken(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });
      if (!user) throw new NotFoundException("user doesn't exist");

      // 3. check if password changed after token was issued
      if (
        user.passwordChangedAt &&
        new Date(payload.exp * 1000) < new Date(user.passwordChangedAt)
      )
        throw new ForbiddenException('password changed! login again');
      // 4. attach the payload to the request
      request.user = this.sanitizeObject(user);
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException('Invalid token! login');
    }

    return true;
  }

  private sanitizeObject(user: Record<string, any>) {
    const { password, otp, otpExpiresAt, mfaSecret, backupCodes, ...result } =
      user;
    return result;
  }
}
