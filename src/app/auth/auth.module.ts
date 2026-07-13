import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthHelper } from './helper';
import { JwtModule } from '@nestjs/jwt';
import { AuthMfaService } from './auth-mfa.service';
import { AuthMfaController } from './auth-mfa.controller';
import { AuthGoogleService } from './auth-google.service';
import { AuthRepo } from './repository/auth.repository';

@Module({
  imports: [JwtModule],
  controllers: [AuthController, AuthMfaController],
  providers: [
    AuthRepo,
    AuthService,
    AuthHelper,
    AuthMfaService,
    AuthGoogleService,
  ],
  exports: [AuthService, AuthHelper, AuthMfaService, AuthGoogleService],
})
export class AuthModule {}
