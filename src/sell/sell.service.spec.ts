import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NFTStatus } from '@prisma/client';
import { createNFT, mockNFTRep } from '../nft/mock.nft';
import { NFTRepository } from '../nft/nft.repository';
import { createTeam, mockTeamRep } from '../team/mock.team';
import { TeamRepository } from '../team/team.repository';
import { Role } from '../user/role/role.enum';
import { createUser, mockUserRep } from '../user/user.mock';
import { UserRepository } from '../user/user.repository';
import { mockSellRep } from './sell.mock';
import { SellModel } from './sell.model';
import { SellRepository } from './sell.repository';
import { SellService } from './sell.service';

// For testing date as they are created with Date.now()
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


let index = 0;
describe('SellService', () => {
  let service: SellService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<SellService>(SellService);
  });

  beforeEach(() => {
    index = 0;
    mockSellRep.sellArray = [];
    mockSellRep.index = 0;
    mockNFTRep.nftArray = [];
    mockNFTRep.index = 0;
    mockUserRep.userArray = [];
    mockUserRep.index = 0;
    mockTeamRep.teamArray = [];
    mockTeamRep.index = 0;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create sell', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const buyer = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [buyer.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = buyer.id;

    const sell = await service.createSell(sellModel);

    expect(sell).toBeDefined();
    expect(sell.id).toBeDefined();
    expect(sell.nftId).toEqual(nft.id);
    expect(sell.price).toEqual(5);
    expect(sell.sellerId).toEqual(user.id);
    expect(sell.buyerId).toEqual(buyer.id);
    expect(mockTeamRep.teamArray[0].balance).toEqual(105);
    expect(mockNFTRep.nftArray[0].previousOwnersId[0]).toEqual(user.id);
    expect(mockTeamRep.teamArray[1].balance).toEqual(95);
  });

  it('should create multiple sells', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const nft2 = createNFT(mockNFTRep, 1, 'name2', 'img2', user2.id, 50, null, NFTStatus.PUBLISHED);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    expect(user2.id).toBe(nft2.ownerId);
    expect(user.id).toBe(nft.ownerId);

    const sell = await service.createSell(sellModel);

    expect(sell).toBeDefined();
    expect(sell.id).toBeDefined();
    expect(sell.nftId).toEqual(nft.id);
    expect(sell.price).toEqual(5);
    expect(sell.sellerId).toEqual(user.id);
    expect(mockNFTRep.nftArray[0].previousOwnersId[0]).toEqual(user.id);
    expect(sell.buyerId).toEqual(user2.id);
    expect(mockTeamRep.teamArray[0].balance).toEqual(105);
    expect(mockTeamRep.teamArray[1].balance).toEqual(95);

    const sellModel2 = new SellModel();
    sellModel2.nftId = nft2.id;
    sellModel2.price = 50;
    sellModel2.sellerId = user2.id;
    sellModel2.buyerId = user.id;

    expect(user2.id).toBe(nft2.ownerId);

    const sell2 = await service.createSell(sellModel2);

    expect(sell2).toBeDefined();
    expect(sell2.id).toBeDefined();
    expect(mockNFTRep.nftArray[1].previousOwnersId[0]).toEqual(user2.id);
    expect(sell2.nftId).toEqual(nft2.id);
    expect(sell2.price).toEqual(50);
    expect(sell2.sellerId).toEqual(user2.id);
    expect(sell2.buyerId).toEqual(user.id);
    expect(mockTeamRep.teamArray[0].balance).toEqual(55);
    expect(mockTeamRep.teamArray[1].balance).toEqual(145);
  });
  it('should sell back', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    expect(user.id).toBe(nft.ownerId);

    const sell = await service.createSell(sellModel);

    expect(sell).toBeDefined();
    expect(sell.id).toBeDefined();
    expect(sell.nftId).toEqual(nft.id);
    expect(sell.price).toEqual(5);
    expect(sell.sellerId).toEqual(user.id);
    expect(mockNFTRep.nftArray[0].previousOwnersId[0]).toEqual(user.id);
    expect(sell.buyerId).toEqual(user2.id);
    expect(mockTeamRep.teamArray[0].balance).toEqual(105);
    expect(mockTeamRep.teamArray[1].balance).toEqual(95);

    const sellModel2 = new SellModel();
    sellModel2.nftId = nft.id;
    sellModel2.price = 5;
    sellModel2.sellerId = user2.id;
    sellModel2.buyerId = user.id;

    const sell2 = await service.createSell(sellModel2);

    expect(sell2).toBeDefined();
    expect(sell2.id).toBeDefined();
    expect(sell2.nftId).toEqual(nft.id);
    expect(sell2.price).toEqual(5);
    expect(sell2.sellerId).toEqual(user2.id);
    expect(sell2.buyerId).toEqual(user.id);
    expect(mockNFTRep.nftArray[0].previousOwnersId[1]).toEqual(user2.id);
    expect(mockTeamRep.teamArray[0].balance).toEqual(100);
    expect(mockTeamRep.teamArray[1].balance).toEqual(100);
  });

  it('should not  sell a nft which doesnt belongs to self', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user2.id;
    sellModel.buyerId = user.id;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
  });
  it('should not sell if user doesnt belong to a team', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user2.id;
    sellModel.buyerId = user.id;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
  });

  it('should not sell if buyer doesnt belong to a team', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user2.id;
    sellModel.buyerId = user.id;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
  });

  it('should not sell null nft', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = null;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }

    expect(mockTeamRep.teamArray[0].balance).toBe(100);
    expect(mockTeamRep.teamArray[1].balance).toBe(100);
  });
  it('should not sell with a null seller', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = null;
    sellModel.buyerId = user2.id;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
    expect(mockTeamRep.teamArray[0].balance).toBe(100);
    expect(mockTeamRep.teamArray[1].balance).toBe(100);
    expect(mockNFTRep.nftArray[0].ownerId).toBe(user.id);
  });
  it('should not sell with a null buyer', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = null;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
    expect(mockTeamRep.teamArray[0].balance).toBe(100);
    expect(mockTeamRep.teamArray[1].balance).toBe(100);
    expect(mockNFTRep.nftArray[0].ownerId).toBe(user.id);
  });

  it('should not sell with a null price', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = null;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
    expect(mockTeamRep.teamArray[0].balance).toBe(100);
    expect(mockTeamRep.teamArray[1].balance).toBe(100);
    expect(mockNFTRep.nftArray[0].ownerId).toBe(user.id);
  });

  it('should not sell with a negative price', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = -1;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
    expect(mockTeamRep.teamArray[0].balance).toBe(100);
    expect(mockTeamRep.teamArray[1].balance).toBe(100);
    expect(mockNFTRep.nftArray[0].ownerId).toBe(user.id);
  });

  it('should not sell with a price of 0', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 0;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    try {
      expect(await service.createSell(sellModel))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
    expect(mockTeamRep.teamArray[0].balance).toBe(100);
    expect(mockTeamRep.teamArray[1].balance).toBe(100);
    expect(mockNFTRep.nftArray[0].ownerId).toBe(user.id);
  });

  it('should get sell by id', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    const sell = await service.createSell(sellModel);

    expect(await service.getSell(sell.id)).toStrictEqual(sell);
  });

  it('should get multiple sells by ids', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const nft2 = createNFT(mockNFTRep, 1, 'name2', 'img2', user2.id, 10, null, NFTStatus.PUBLISHED);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    const sellModel2 = new SellModel();
    sellModel2.nftId = nft2.id;
    sellModel2.price = 50;
    sellModel2.sellerId = user2.id;
    sellModel2.buyerId = user.id;

    const sell = await service.createSell(sellModel);

    const sell2 = await service.createSell(sellModel2);


    expect(await service.getSell(sell.id)).toStrictEqual(sell);
    expect(await service.getSell(sell.id)).toStrictEqual(sell);
    expect(await service.getSell(sell.id)).toStrictEqual(sell);

    expect(await service.getSell(sell2.id)).toStrictEqual(sell2);
    expect(await service.getSell(sell2.id)).toStrictEqual(sell2);
    expect(await service.getSell(sell2.id)).toStrictEqual(sell2);

  });
  it('should not get sell by id', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    const sell = await service.createSell(sellModel);

    try {
      expect(await service.getSell(100))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
  });
  it('should not get sell by id null', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    const sell = await service.createSell(sellModel);

    try {
      expect(await service.getSell(null))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
    }
  });

  it('should get all sells singular', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    const sell = await service.createSell(sellModel);

    expect(mockSellRep.getLength()).toBe(1);

    expect(await service.getSells(0, 1000)).toStrictEqual([sell]);
  });

  it('should get all sells multiple', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const nft2 = createNFT(mockNFTRep, 1, 'name2', 'img2', user2.id, 10, null, NFTStatus.PUBLISHED);


    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    const sell = await service.createSell(sellModel);

    const sellModel2 = new SellModel();
    sellModel2.nftId = nft2.id;
    sellModel2.price = 50;
    sellModel2.sellerId = user2.id;
    sellModel2.buyerId = user.id;

    const sell2 = await service.createSell(sellModel2);

    expect(mockSellRep.getLength()).toBe(2);

    expect(await service.getSells(0, 1000)).toStrictEqual([sell, sell2]);
  });
  it('should get all sells which is none', async () => {
    expect(mockSellRep.getLength()).toBe(0);

    expect(await service.getSells(0, 1000)).toStrictEqual([]);
  });

  it('should get the last sells', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const nft2 = createNFT(mockNFTRep, 1, 'name2', 'img2', user2.id, 10, null, NFTStatus.PUBLISHED);


    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    const sell = await service.createSell(sellModel);

    const sellModel2 = new SellModel();
    sellModel2.nftId = nft2.id;
    sellModel2.price = 50;
    sellModel2.sellerId = user2.id;
    sellModel2.buyerId = user.id;

    // wait for 500 ms to ensure that the second sell is created after the first one
    await sleep(500);

    const sell2 = await service.createSell(sellModel2);

    expect(mockSellRep.getLength()).toBe(2);


    expect(sell.createdAt.getTime()).toBeLessThan(sell2.createdAt.getTime());

    expect(await service.getLastSells(0, 1000)).toStrictEqual([sell2, sell]);
    expect(await service.getLastSells(1, 1)).toStrictEqual([sell]);
    expect(await service.getLastSells(0, 1)).toStrictEqual([sell2]);

  });
  it('should get the last sells which is none', async () => {
    expect(mockSellRep.getLength()).toBe(0);

    expect(await service.getLastSells(0, 1000)).toStrictEqual([]);
  });

  it('should get own sells', async () => {


    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    const nft2 = createNFT(mockNFTRep, 1, 'name2', 'img2', user2.id, 10, null, NFTStatus.PUBLISHED);  


    const sellModel = new SellModel();
    sellModel.nftId = nft.id;
    sellModel.price = 5;
    sellModel.sellerId = user.id;
    sellModel.buyerId = user2.id;

    const sell = await service.createSell(sellModel);

    const sellModel2 = new SellModel();
    sellModel2.nftId = nft2.id;
    sellModel2.price = 50;
    sellModel2.sellerId = user2.id;
    sellModel2.buyerId = user.id;

    const sell2 = await service.createSell(sellModel2);

    expect(mockSellRep.getLength()).toBe(2);

    expect(await service.getOwnSells(user.id, 0, 1000)).toStrictEqual([sell]);
    expect(await service.getOwnSells(user2.id, 0, 1000)).toStrictEqual([sell2]);

  });

  it('should get own sells which is none', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pass', Role.User);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'team', 100, [user.id]);

    const nft = createNFT(mockNFTRep, 0, 'name', 'img', user.id, 10, null, NFTStatus.PUBLISHED);

    const user2 = createUser(mockUserRep, 1, 'buyer', 'mail1', 'addr1', 'pass', Role.User);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'team2', 100, [user2.id]);

    expect(mockSellRep.getLength()).toBe(0);

    expect(await service.getOwnSells(user.id, 0, 1000)).toStrictEqual([]);
    expect(await service.getOwnSells(user2.id, 0, 1000)).toStrictEqual([]);
    
  });
});
