import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './lib/database';
import { EmailModule } from './app/email/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './app/auth';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './app/auth/guards';
import { PostModule } from './app/post';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    EmailModule,
    PostModule,
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
