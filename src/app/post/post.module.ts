import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostRepo } from './repository/post.repository';
import { PostController } from './post.controller';
import { PostHelper } from './helper';
import { MediaModule } from 'src/shared/media';

@Module({
  imports: [MediaModule],
  controllers: [PostController],
  providers: [PostService, PostRepo, PostHelper],
  exports: [PostService],
})
export class PostModule {}
