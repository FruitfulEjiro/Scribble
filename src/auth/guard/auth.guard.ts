import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1] ?? [];
    if (!token) {
      throw new UnauthorizedException('you are not logged in');
    }
    const payload = await this.jwtService.verifyAsync(token, {
      secret: <string>this.configService.get<string>('accessTokenSecret'),
    });
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) throw new UnauthorizedException('you are not logged in');
    if (user.passwordChangedAt && user.passwordChangedAt!.getTime() > payload.iat.getTime())
      throw new UnauthorizedException('password was changed, Login in again!');

    request['user'] = payload;
    return true;
  }
}
