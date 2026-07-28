import { Global, Module } from '@nestjs/common';
import { HelperService } from '../../lib/helpers';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [JwtModule],
  exports: [HelperService],
  providers: [HelperService],
})
export class CommonModule {}
