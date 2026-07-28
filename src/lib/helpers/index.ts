import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class HelperService {
  constructor(private readonly jwt: JwtService) {}

  async verifyAccessToken(token: string) {
    return await this.jwt.verify(token, {
      secret: process.env['ACCESS_TOKEN_SECRET'],
    });
  }

  async verifyRefreshToken(token: string) {
    return await this.jwt.verify(token, {
      secret: process.env['REFRESH_TOKEN_SECRET'],
    });
  }
}
