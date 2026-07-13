import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostRepo } from './repository/post.repository';
import { PostController } from './post.controller';
import { PostHelper } from './helper';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [PostService, PostRepo, PostHelper],
  exports: [PostService],
})
export class PostModule {}
