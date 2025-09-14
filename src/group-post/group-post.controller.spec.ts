import { Test, TestingModule } from '@nestjs/testing';
import { GroupPostController } from './group-post.controller';

describe('GroupPostController', () => {
  let controller: GroupPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupPostController],
    }).compile();

    controller = module.get<GroupPostController>(GroupPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
