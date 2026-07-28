import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './media.provider';
import { MediaService } from './media.service';

@Module({
  providers: [CloudinaryProvider, MediaService],
  exports: [MediaService],
})
export class MediaModule {}
