import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiStatus(): string {
    return 'Api is running...!';
  }
}
