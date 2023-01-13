import { Test, TestingModule } from '@nestjs/testing';
import { mockNFTRep } from '../nft/mock.nft';
import { NFTRepository } from '../nft/nft.repository';
import { mockTeamRep } from '../team/mock.team';
import { TeamRepository } from '../team/team.repository';
import { mockUserRep } from '../user/user.mock';
import { UserRepository } from '../user/user.repository';
import { SellController } from './sell.controller';
import { mockSellRep } from './sell.mock';
import { SellRepository } from './sell.repository';
import { SellService } from './sell.service';

describe('SellController', () => {
  let controller: SellController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellController],
      providers: [SellService,
        {
          provide: SellRepository,
          useValue: mockSellRep,
        },
        {
          provide: NFTRepository,
          useValue: mockNFTRep,
        
        },
        {
          provide: UserRepository,
          useValue: mockUserRep,
        },
        {
          provide: TeamRepository,
          useValue: mockTeamRep,
        }
      ],
    }).compile();

    controller = module.get<SellController>(SellController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
