import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { ConfigModule } from '@nestjs/config';
import { GroupPostModule } from './group-post/group-post.module';
import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    AuthModule,
    UserModule,
    PostModule,
    GroupPostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
