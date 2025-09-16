import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [PrismaModule, JwtModule, EmailModule],
})
export class PostModule {}
