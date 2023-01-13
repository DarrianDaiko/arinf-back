import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { NFTRepository } from './nft.repository';
import { mockNFTRep } from './mock.nft';
import { UserRepository } from '../user/user.repository';
import { mockUserRep } from '../user/user.mock';
import { RatingRepository } from '../rating/rating.repository';

describe('NftController', () => {
  let controller: NftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftController],
      providers: [
        NftService,
        Logger,
        {
          provide: NFTRepository,
          useValue: mockNFTRep,
        },
        {
          provide: UserRepository,
          useValue: mockUserRep,
        },
        {
          provide: RatingRepository,
          useValue: {},
        }
      ]
    }).compile();

    controller = module.get<NftController>(NftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
