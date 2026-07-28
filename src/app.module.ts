import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './app/auth';
import { APP_GUARD } from '@nestjs/core';
import { PostModule } from './app/post';
import { EmailModule } from './shared/email';
import { AuthGuard } from './lib/guards';
import { CommonModule } from './shared/common';
import { InviteModule } from './app/invite/invite.module';
import { UserModule } from './app/user';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './shared/crons';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    EmailModule,
    PostModule,
    UserModule,
    InviteModule,
    CronModule,

    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
