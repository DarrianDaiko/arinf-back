import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockNFTRep } from '../nft/mock.nft';
import { NFTRepository } from '../nft/nft.repository';
import { mockUserRep } from '../user/user.mock';
import { UserRepository } from '../user/user.repository';
import { CollectionController } from './collection.controller';
import { mockCollectionRep } from './collection.mock';
import { CollectionRepository } from './collection.repository';
import { CollectionService } from './collection.service';

describe('CollectionController', () => {
  let controller: CollectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [CollectionService,
        {
          provide: CollectionRepository,
          useValue: mockCollectionRep,
        },
        {
          provide: NFTRepository,
          useValue: mockNFTRep,
        },
        {
          provide: UserRepository,
          useValue: mockUserRep,
        },
        Logger
      ],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
