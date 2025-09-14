import { Module } from '@nestjs/common';
import { GroupPostController } from './group-post.controller';
import { GroupPostService } from './group-post.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [GroupPostController],
  providers: [GroupPostService],
  imports: [PrismaModule]
})
export class GroupPostModule {}
