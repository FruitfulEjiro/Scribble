import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  v2 as cloudinaryType,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import { CLOUDINARY } from './media.provider';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinary: typeof cloudinaryType,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folder = 'scribble',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            this.logger.error('error uploading file to cloudinary', error);
            return reject(error);
          }
          if (!result) {
            this.logger.warn("couldn't upload file to cloudinary", result);
            return reject(new Error('Upload result is undefined'));
          }
          this.logger.log('succeccfully uploaded file to cloudinary');
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok') {
        this.logger.warn("couldn't upload file to cloudinary", result);
        throw new Error(
          `Failed to delete image from Cloudinary: ${result.result}`,
        );
      }
    } catch (error) {
      this.logger.error('failed to delete file to cloudinary', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }
}
