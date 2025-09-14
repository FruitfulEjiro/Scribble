import { Test, TestingModule } from '@nestjs/testing';
import { GroupPostService } from './group-post.service';

describe('GroupPostService', () => {
  let service: GroupPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupPostService],
    }).compile();

    service = module.get<GroupPostService>(GroupPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
