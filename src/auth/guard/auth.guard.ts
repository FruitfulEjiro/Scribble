// import { Injectable } from "@nestjs/common";
// import { AuthGuard } from "@nestjs/passport";

// @Injectable()
// export class Protect extends AuthGuard("jwt") {

// }

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  // constructor(
  //     private readonly userService: UserService,
  //     private readonly configService: ConfigService,
  //   ) {
  //     super({
  //       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //       ignoreExpiration: false,
  //       secretOrKey: <string>configService.get<string>('accessTokenSecret'),
  //     });
  //   }

  //   async validate(payload: any) {
  //     const user = await this.userService.findUserById(payload.id);
  //     if (!user) throw new UnauthorizedException('you are not logged in');
  //     return {
  //       ...user,
  //       userType: payload.userType,
  //     };
  //   }

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (!token) {
      throw new UnauthorizedException("you are not logged in");
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: <string>this.configService.get<string>('accessTokenSecret'),
      });
      const user = await this.userService.findUserById(payload.id);
      if (!user) throw new UnauthorizedException('you are not logged in');
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  //   private extractTokenFromHeader(request: Request): string | undefined {
  //     const [type, token] = request.headers.authorization?.split(' ') ?? [];
  //     return type === 'Bearer' ? token : undefined;
  //   }
}
