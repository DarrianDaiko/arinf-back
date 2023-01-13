import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NFT, NFTStatus, PrismaClient } from '@prisma/client';
import { NFTModel } from './nft.model';
import { NftService } from './nft.service';
import { NFTRepository } from './nft.repository';
import { mockNFTRep } from './mock.nft';
import { UserRepository } from '../user/user.repository';
import { createUser, mockUserRep } from '../user/user.mock';
import { RatingRepository } from '../rating/rating.repository';
import { Role } from '../user/role/role.enum';
import { HttpException } from '@nestjs/common/exceptions';

let data = [];
let index = 0;

describe('NftService', () => {
  let service: NftService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();
    service = module.get<NftService>(NftService);
  })

  beforeEach(async () => {
    index = 0;
    data = [];
    mockUserRep.index = index;
    mockUserRep.userArray = [];
    mockNFTRep.index = index;
    mockNFTRep.nftArray = [];

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('should create nft', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);
  });

  it('should create two nfts', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    const nft2 = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    expect(nft2).toBeDefined();
    expect(nft2.name).toBe('test');
    expect(nft2.status).toBe(NFTStatus.DRAFT);
    expect(nft2.image).toBe('test');
    expect(nft2.price).toBe(1);
  });

  it('should not create a nft with missing fields', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    // no name
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    try {
      const nft = await service.createNFT(user.id, model);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not create nft that belongs to nobody', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    // no owner
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    try {
      const nft = await service.createNFT(user.id + 10, model);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not create a null nft', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    try {
      const nft = await service.createNFT(user.id, null);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not create nft with negative price', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = -1;
    model.status = NFTStatus.DRAFT;

    try {
      const nft = await service.createNFT(user.id, model);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should update nft', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    nft.name = 'test2';
    nft.status = NFTStatus.PUBLISHED;
    nft.image = 'test2';
    nft.price = 2;

    const nft2 = await service.updateNFT(user.id, nft.id, nft);
    expect(nft2).toBeDefined();
    expect(nft2.name).toBe('test2');
    expect(nft2.status).toBe(NFTStatus.PUBLISHED);
    expect(nft2.image).toBe('test2');
    expect(nft2.price).toBe(2);
  });
  it('should not update a NFT that doesnt belong to user', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    nft.name = 'test2';
    nft.status = NFTStatus.PUBLISHED;
    nft.image = 'test2';
    nft.price = 2;

    try {
      const nft2 = await service.updateNFT(user.id + 1, nft.id, nft);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should be allowed as it is the owner', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);
    expect(nft.ownerId).toBe(user.id);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(mockNFTRep.nftArray[0].id).toBe(0);
    expect(mockNFTRep.nftArray[0].name).toBe('test');

    expect(await service.isOwnerOrAllowed(user.id, nft.id)).toBe(true);
  });

  it('should not be allowed as it is not the owner', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    expect(await service.isOwnerOrAllowed(user.id + 10, nft.id)).toBe(false);
  });

  it('should be allowed as it is an admin', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    const admin = createUser(mockUserRep, 1, 'admin', 'mail1', 'addr1', 'pwd', Role.Admin);

    expect(await service.isOwnerOrAllowed(admin.id, nft.id)).toBe(true);
  });

  it('should not be allowed as it is not the owner of specific nft', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const user2 = createUser(mockUserRep, 1, 'user2', 'mail2', 'addr2', 'pwd2', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const model2 = new NFTModel();
    model2.name = 'test2';
    model2.image = 'test2';
    model2.ownerId = user2.id;
    model2.price = 2;
    model2.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);
    const nft2 = await service.createNFT(user2.id, model2);
    expect(nft2).toBeDefined();
    expect(mockNFTRep.getLength()).toBe(2);

    expect(await service.isOwnerOrAllowed(user.id, nft2.id)).toBe(false);
    expect(await service.isOwnerOrAllowed(user2.id, nft.id)).toBe(false);
    expect(await service.isOwnerOrAllowed(user.id, nft.id)).toBe(true);
    expect(await service.isOwnerOrAllowed(user2.id, nft2.id)).toBe(true);

  });


  it('should not be allowed as there is not nft', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    expect(await service.isOwnerOrAllowed(user.id, 10000)).toBe(false);
  });

  it('should not be allowed as values are null', async () => {

    expect(await service.isOwnerOrAllowed(null, null)).toBe(false);
  });
  it('should not update a NFT that doesnt exist', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    nft.name = 'test2';
    nft.status = NFTStatus.PUBLISHED;
    nft.image = 'test2';
    nft.price = 2;

    try {
      const nft2 = await service.updateNFT(user.id, nft.id + 1, nft);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not update a NFT with negative price', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    nft.name = 'test2';
    nft.status = NFTStatus.PUBLISHED;
    nft.image = 'test2';
    nft.price = -2;

    try {
      const nft2 = await service.updateNFT(user.id, nft.id, nft);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should update a NFT bc requester is an admin', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail1', 'addr1', 'pwd1', Role.Admin);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.DRAFT;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.DRAFT);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    nft.name = 'test2';
    nft.status = NFTStatus.PUBLISHED;
    nft.image = 'test2';
    nft.price = -2;

    try {
      const nft2 = await service.updateNFT(admin.id, nft.id, nft);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not update NFT because status go back to previous one', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;

    const nft = await service.createNFT(user.id, model);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);


    nft.status = NFTStatus.DRAFT;

    try {
      const nft2 = await service.updateNFT(user.id, nft.id, nft);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should delete own nft', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    await service.deleteNFT(user.id, nft.id);
    expect(mockNFTRep.getLength()).toBe(0);
  });
  it('should not delete nft because requester is not the owner', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const user2 = createUser(mockUserRep, 1, 'user2', 'mail2', 'addr2', 'pwd2', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    expect(user2.id).not.toBe(user.id);

    try {
      let r = await service.deleteNFT(user2.id, nft.id);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
    expect(mockNFTRep.getLength()).toBe(1);
  });

  it('should delete nft because requester is an admin', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail2', 'addr2', 'pwd2', Role.Admin);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    await service.deleteNFT(admin.id, nft.id);
    expect(mockNFTRep.getLength()).toBe(0);
  });

  it('should not delete a null nft', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail2', 'addr2', 'pwd2', Role.Admin);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);
    expect(mockNFTRep.getLength()).toBe(1);

    try {
      await service.deleteNFT(admin.id, null);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
    expect(mockNFTRep.getLength()).toBe(1);
  });

  it('should not delete a nft because requester is null', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail2', 'addr2', 'pwd2', Role.Admin);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    try {
      await service.deleteNFT(null, nft.id);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
    expect(mockNFTRep.getLength()).toBe(1);
  });

  it('should get a nft', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail2', 'addr2', 'pwd2', Role.Admin);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    const nft2 = await service.getNFT(user.id, nft.id);
    expect(nft2).toBeDefined();
    expect(nft2.name).toBe('test');
    expect(nft2.status).toBe(NFTStatus.PUBLISHED);
    expect(nft2.image).toBe('test');
    expect(nft2.price).toBe(1);
  });

  it('should not get a nft because requester is null', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    try {
      await service.getNFT(null, nft.id);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not get a nft because nft is null', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    try {
      await service.getNFT(user.id, null);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not get nft because there is no NFT with this id', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    expect(mockNFTRep.getLength()).toBe(0);

    try {
      await service.getNFT(user.id, 0);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not get nft because requester is not the owner', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const user2 = createUser(mockUserRep, 1, 'user2', 'mail2', 'addr2', 'pwd2', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    try {
      await service.getNFT(user2.id, nft.id);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should get nft bc requester is an admin', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail2', 'addr2', 'pwd2', Role.Admin);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    const nft2 = await service.getNFT(admin.id, nft.id);
    expect(nft2).toBeDefined();
    expect(nft2.name).toBe('test');
    expect(nft2.status).toBe(NFTStatus.PUBLISHED);
    expect(nft2.image).toBe('test');
    expect(nft2.price).toBe(1);
  });
  it('should get all nfts (1)', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    const nfts = await service.getNFTs(user.id, 0, 1000);
    expect(nfts).toBeDefined();
    expect(nfts.length).toBe(1);
    expect(nfts[0].name).toBe('test');
    expect(nfts[0].status).toBe(NFTStatus.PUBLISHED);
    expect(nfts[0].image).toBe('test');
    expect(nfts[0].price).toBe(1);
  });
  it('should get all nfts (2)', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail2', 'addr2', 'pwd2', Role.Admin);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    const nft2 = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(2);
    expect(nft2).toBeDefined();
    expect(nft2.name).toBe('test');
    expect(nft2.status).toBe(NFTStatus.PUBLISHED);
    expect(nft2.image).toBe('test');
    expect(nft2.price).toBe(1);

    const nfts = await service.getNFTs(user.id, 0, 1000);
    expect(nfts).toBeDefined();
    expect(nfts.length).toBe(2);
    expect(nfts[0].name).toBe('test');
    expect(nfts[0].status).toBe(NFTStatus.PUBLISHED);
    expect(nfts[0].image).toBe('test');
    expect(nfts[0].price).toBe(1);
    expect(nfts[1].name).toBe('test');
    expect(nfts[1].status).toBe(NFTStatus.PUBLISHED);
    expect(nfts[1].image).toBe('test');
    expect(nfts[1].price).toBe(1);
  });
  it('should get all nfts (3)', async () => {

    // create user

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail2', 'addr2', 'pwd2', Role.Admin);

    const model = new NFTModel();
    model.name = 'test';
    model.image = 'test';
    model.ownerId = user.id;
    model.price = 1;
    model.status = NFTStatus.PUBLISHED;
    expect(mockNFTRep.getLength()).toBe(0);

    const nft = await service.createNFT(user.id, model);
    expect(mockNFTRep.getLength()).toBe(1);
    expect(nft).toBeDefined();
    expect(nft.name).toBe('test');
    expect(nft.status).toBe(NFTStatus.PUBLISHED);
    expect(nft.image).toBe('test');
    expect(nft.price).toBe(1);

    const nft2 = await service.createNFT(admin.id, model);
    expect(mockNFTRep.getLength()).toBe(2);
    expect(nft2).toBeDefined();
    expect(nft2.name).toBe('test');
    expect(nft2.status).toBe(NFTStatus.PUBLISHED);
    expect(nft2.image).toBe('test');
    expect(nft2.price).toBe(1);

    const nfts = await service.getNFTs(user.id, 0, 1000);
    expect(nfts).toBeDefined();
    expect(nfts.length).toBe(mockNFTRep.getLength());
    expect(nfts[0].name).toBe('test');
    expect(nfts[0].status).toBe(NFTStatus.PUBLISHED);
    expect(nfts[0].image).toBe('test');
    expect(nfts[0].price).toBe(1);
  });
  it('should get all nfts which is empty', async () => {
      
      // create user
  
      const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
  
      const nfts = await service.getNFTs(user.id, 0, 1000);
      expect(nfts).toBeDefined();
      expect(nfts.length).toBe(0);
    }); 
    it('should get no nft bc of pagination', async () => {
        
        // create user
    
        const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

        const model = new NFTModel();
        model.name = 'test';
        model.image = 'test';
        model.ownerId = user.id;
        model.price = 1;
        model.status = NFTStatus.PUBLISHED;
        expect(mockNFTRep.getLength()).toBe(0);
    
        const nft = await service.createNFT(user.id, model);

        const nfts = await service.getNFTs(user.id, 2, 1);
        expect(nfts).toBeDefined();
        expect(nfts.length).toBe(0);
      }); 
});
