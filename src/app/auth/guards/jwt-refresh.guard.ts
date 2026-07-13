import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthHelper } from '../helper';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  private readonly logger = new Logger(JwtRefreshGuard.name);
  constructor(private readonly helper: AuthHelper) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Get refresh token from the cookie
    const token = request.cookies.refresh_token;
    if (!token) {
      throw new UnauthorizedException('No refresh token found');
    }
    try {
      // 2. verify token
      const payload = await this.helper.verifyRefreshToken(token);
      // 3. Attach the userId and  token to the request
      request.user = {
        id: payload.id,
        refreshToken: token,
      };
    } catch (err) {
      this.logger.error('invalid refresh tokenn', err);
      throw new UnauthorizedException('Invalid refresh tokenn');
    }

    return true;
  }
}
