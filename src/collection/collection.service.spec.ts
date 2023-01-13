import { HttpException, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NFTStatus } from '@prisma/client';
import { createNFT, mockNFTRep } from '../nft/mock.nft';
import { NFTRepository } from '../nft/nft.repository';
import { Role } from '../user/role/role.enum';
import { createUser, mockUserRep } from '../user/user.mock';
import { UserRepository } from '../user/user.repository';
import { mockCollectionRep } from './collection.mock';
import { CollectionModel } from './collection.model';
import { CollectionRepository } from './collection.repository';
import { CollectionService } from './collection.service';

let index = 0;
describe('CollectionService', () => {
  let service: CollectionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<CollectionService>(CollectionService);
  });

  beforeEach(() => {
    index = 0;
    mockCollectionRep.collectionArray = [];
    mockCollectionRep.index = 0;
    mockNFTRep.nftArray = [];
    mockNFTRep.index = 0;
    mockUserRep.userArray = [];
    mockUserRep.index = 0;

  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a collection', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    expect(collection).toBeDefined();
    expect(collection.id).toBe(0);
    expect(collection.name).toBe('collection');
    expect(collection.logo).toBe('logo');
    expect(collection.status).toBe(NFTStatus.DRAFT);
    expect(collection.creatorId).toBe(user.id);
    expect(collection.nftsIds).toBeDefined();
    expect(collection.nftsIds.length).toBe(0);
  });

  it('should create multiple collections', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);
    const collection2 = await service.createCollection(user.id, model);

    expect(collection).toBeDefined();
    expect(collection.id).toBe(0);
    expect(collection.name).toBe('collection');
    expect(collection.logo).toBe('logo');
    expect(collection.status).toBe(NFTStatus.DRAFT);
    expect(collection.creatorId).toBe(user.id);
    expect(collection.nftsIds).toBeDefined();
    expect(collection.nftsIds.length).toBe(0);

    expect(collection2).toBeDefined();
    expect(collection2.id).toBe(1);
    expect(collection2.name).toBe('collection');
    expect(collection2.logo).toBe('logo');
    expect(collection2.status).toBe(NFTStatus.DRAFT);
    expect(collection2.creatorId).toBe(user.id);
    expect(collection2.nftsIds).toBeDefined();
    expect(collection2.nftsIds.length).toBe(0);
  });
  it('should not create a collection with a non existing creator', async () => {
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = 0;
    model.nftsIds = [];

    try {
      await service.createCollection(0, model);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });
  it('should not create a collection with a non existing model', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    try {
      await service.createCollection(user.id, undefined);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should update collection', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const model2 = new CollectionModel();

    model2.name = 'collection2';
    model2.logo = 'logo2';
    model2.status = NFTStatus.DRAFT;
    model2.creatorId = user.id;
    model2.nftsIds = [];

    const collection2 = await service.updateCollection(user.id, collection.id, model2);

    expect(collection2).toBeDefined();
    expect(collection2.id).toBe(0);
    expect(collection2.name).toBe('collection2');
    expect(collection2.logo).toBe('logo2');
    expect(collection2.status).toBe(NFTStatus.DRAFT);
    expect(collection2.creatorId).toBe(user.id);
    expect(collection2.nftsIds).toBeDefined();
    expect(collection2.nftsIds.length).toBe(0);
  });

  it('should not update with non existing nfts', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const model2 = new CollectionModel();

    model2.name = 'collection2';
    model2.logo = 'logo2';
    model2.status = NFTStatus.DRAFT;
    model2.creatorId = user.id;
    model2.nftsIds = [0, 4, 10];

    try {
      await service.updateCollection(user.id, collection.id, model2);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });
  it('should not update collection of another owner', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const user2 = createUser(mockUserRep, 1, 'user2', 'mail2', 'addr2', 'pwd2', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const model2 = new CollectionModel();

    model2.name = 'collection2';
    model2.logo = 'logo2';
    model2.status = NFTStatus.DRAFT;
    model2.creatorId = user.id;
    model2.nftsIds = [];

    try {
      await service.updateCollection(user2.id, collection.id, model2);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should update collection of another owner bc user is an admin', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const user2 = createUser(mockUserRep, 1, 'user2', 'mail2', 'addr2', 'pwd2', Role.Admin);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const model2 = new CollectionModel();

    model2.name = 'collection2';
    model2.logo = 'logo2';
    model2.status = NFTStatus.DRAFT;
    model2.creatorId = user.id;
    model2.nftsIds = [];

    const collection2 = await service.updateCollection(user2.id, collection.id, model2);

    expect(collection2).toBeDefined();
    expect(collection2.id).toBe(0);
    expect(collection2.name).toBe('collection2');
    expect(collection2.logo).toBe('logo2');
    expect(collection2.status).toBe(NFTStatus.DRAFT);
    expect(collection2.creatorId).toBe(user.id);
    expect(collection2.nftsIds).toBeDefined();
    expect(collection2.nftsIds.length).toBe(0);
  });

  it('should not update collection with non existing model', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    try {
      await service.updateCollection(user.id, collection.id, null);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should delete collection', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    await service.deleteCollection(user.id, collection.id);

    expect(mockCollectionRep.getLength()).toBe(0);

  });

  it('should not delete non existing collection', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    try {
      await service.deleteCollection(user.id, 0);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }

  });

  it('should not delete collection of another owner', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const user2 = createUser(mockUserRep, 1, 'user2', 'mail2', 'addr2', 'pwd2', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    try {
      await service.deleteCollection(user2.id, collection.id);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }

  });

  it('should delete collection of another owner bc user is an admin', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const user2 = createUser(mockUserRep, 1, 'user2', 'mail2', 'addr2', 'pwd2', Role.Admin);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    await service.deleteCollection(user2.id, collection.id);

    expect(mockCollectionRep.getLength()).toBe(0);

  });

  it('should not delete a collection twice', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    await service.deleteCollection(user.id, collection.id);

    try {
      await service.deleteCollection(user.id, collection.id);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }

  });

  it('should get collection by id', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const collection2 = await service.getCollection(user.id, collection.id);

    expect(collection2).toBeDefined();
    expect(collection2.id).toBe(0);
    expect(collection2.name).toBe('collection');
    expect(collection2.logo).toBe('logo');
    expect(collection2.status).toBe(NFTStatus.DRAFT);
    expect(collection2.creatorId).toBe(user.id);
    expect(collection2.nftsIds).toBeDefined();
    expect(collection2.nftsIds.length).toBe(0);

    const collection3 = await service.getCollection(user.id, collection2.id);

    expect(collection3).toBeDefined();
    expect(collection3.id).toBe(0);
    expect(collection3.name).toBe('collection');
    expect(collection3.logo).toBe('logo');
    expect(collection3.status).toBe(NFTStatus.DRAFT);
    expect(collection3.creatorId).toBe(user.id);
    expect(collection3.nftsIds).toBeDefined();
    expect(collection3.nftsIds.length).toBe(0);
  });

  it('should not get collection by id', async () => {
    try {
      await service.getCollection(null, 0);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });
  it('should not get collection with wrong id', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    try {
      await service.getCollection(user.id, 10);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should get all collections', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    await service.createCollection(user.id, model);
    await service.createCollection(user.id, model);
    await service.createCollection(user.id, model);

    const collections = await service.getCollections(0, 1000);

    expect(collections).toBeDefined();
    expect(collections.length).toBe(3);
  });

  it('should get all collections once', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    await service.createCollection(user.id, model);

    const collections = await service.getCollections(0, 1000);

    expect(collections).toBeDefined();
    expect(collections.length).toBe(1);
  });

  it('should get all collections empty', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const collections = await service.getCollections(0, 1000);

    expect(collections).toBeDefined();
    expect(collections.length).toBe(0);
  });

  it('should add nft to collection', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const nft = createNFT(mockNFTRep, 0, 'nft', 'logo', user.id, 10, null, NFTStatus.DRAFT);

    const collection2 = await service.addNFTToCollection(collection.id, nft.id);

    expect(collection2).toBeDefined();
    expect(collection2.id).toBe(0);
    expect(collection2.name).toBe('collection');
    expect(collection2.logo).toBe('logo');
    expect(collection2.status).toBe(NFTStatus.DRAFT);
    expect(collection2.creatorId).toBe(user.id);
    expect(collection2.nftsIds).toBeDefined();
    expect(collection2.nftsIds.length).toBe(1);
    expect(collection2.nftsIds[0]).toBe(nft.id);

    expect(mockNFTRep.nftArray[0].collectionId).toBe(collection.id);

  });

  it('should add multiple nfts to collection', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const nft = createNFT(mockNFTRep, 0, 'nft', 'logo', user.id, 10, null, NFTStatus.DRAFT);
    const nft2 = createNFT(mockNFTRep, 1, 'nft', 'logo', user.id, 10, null, NFTStatus.DRAFT);

    const collection2 = await service.addNFTToCollection(collection.id, nft.id);
    const collection3 = await service.addNFTToCollection(collection.id, nft2.id);

    expect(collection2).toBeDefined();
    expect(collection2.id).toBe(0);
    expect(collection2.name).toBe('collection');
    expect(collection2.logo).toBe('logo');
    expect(collection2.status).toBe(NFTStatus.DRAFT);
    expect(collection2.creatorId).toBe(user.id);
    expect(collection2.nftsIds).toBeDefined();
    expect(collection2.nftsIds.length).toBe(2);
    expect(collection2.nftsIds[0]).toBe(nft.id);

    expect(collection3).toBeDefined();
    expect(collection3.id).toBe(0);
    expect(collection3.name).toBe('collection');
    expect(collection3.logo).toBe('logo');
    expect(collection3.status).toBe(NFTStatus.DRAFT);
    expect(collection3.creatorId).toBe(user.id);
    expect(collection3.nftsIds).toBeDefined();
    expect(collection3.nftsIds.length).toBe(2);
    expect(collection3.nftsIds[0]).toBe(nft.id);
    expect(collection3.nftsIds[1]).toBe(nft2.id);

    expect(mockNFTRep.nftArray[0].collectionId).toBe(collection.id);
    expect(mockNFTRep.nftArray[1].collectionId).toBe(collection.id);

  });

  it('should not add same nft twice to collection', async () => {

    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const nft = createNFT(mockNFTRep, 0, 'nft', 'logo', user.id, 10, null, NFTStatus.DRAFT);

    const collection2 = await service.addNFTToCollection(collection.id, nft.id);

    expect(collection2).toBeDefined();
    expect(collection2.id).toBe(0);
    expect(collection2.name).toBe('collection');
    expect(collection2.logo).toBe('logo');
    expect(collection2.status).toBe(NFTStatus.DRAFT);
    expect(collection2.creatorId).toBe(user.id);
    expect(collection2.nftsIds).toBeDefined();
    expect(collection2.nftsIds.length).toBe(1);
    expect(collection2.nftsIds[0]).toBe(nft.id);

    expect(mockNFTRep.nftArray[0].collectionId).toBe(collection.id);

    try {
      await service.addNFTToCollection(collection.id, nft.id);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should not add nft to collection if nft is null', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    try {
      await service.addNFTToCollection(collection.id, null);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should not add nft to collection if collection is null', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    await service.createCollection(user.id, model);

    const nft = createNFT(mockNFTRep, 0, 'nft', 'logo', user.id, 10, null, NFTStatus.DRAFT);

    try {
      await service.addNFTToCollection(null, nft.id);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should be owner of collection', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const isOwner = await service.isOwnerOrAdmin(user.id, collection.id);

    expect(isOwner).toBeTruthy();
  });
  it('should not be owner of collection', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const isOwner = await service.isOwnerOrAdmin(user.id + 1, collection.id);

    expect(isOwner).toBeFalsy();
  });

  it('should be admin of collection', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const admin = createUser(mockUserRep, 1, 'admin', 'mail2', 'addr', 'pwd', Role.Admin);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const isAdmin = await service.isOwnerOrAdmin(admin.id, collection.id);

    expect(isAdmin).toBeTruthy();
  });
  it('should not be owner as it is null', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [];

    const collection = await service.createCollection(user.id, model);

    const isOwner = await service.isOwnerOrAdmin(null, collection.id);

    expect(isOwner).toBeFalsy();
  });

  it('should not be owner as collection is null', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);

    const isOwner = await service.isOwnerOrAdmin(user.id, null);

    expect(isOwner).toBeFalsy();
  });

  it('should get top collections', async () => {
    const user = createUser(mockUserRep, 0, 'user', 'mail', 'addr', 'pwd', Role.User);
    const model = new CollectionModel();

    const nft = createNFT(mockNFTRep, 0, 'nft', 'logo', user.id, 10, null, NFTStatus.DRAFT);
    const nft2 = createNFT(mockNFTRep, 1, 'nft2', 'logo', user.id, 20, null, NFTStatus.DRAFT);

    model.name = 'collection';
    model.logo = 'logo';
    model.status = NFTStatus.DRAFT;
    model.creatorId = user.id;
    model.nftsIds = [nft.id, nft2.id];

    await service.createCollection(user.id, model);

    const collections = await service.getTopCollections(user.id, 0, 1000);

    expect(collections).toBeDefined();
    expect(collections.length).toBe(1);
    expect(collections[0].nftsIds.length).toBe(2);
    expect(collections[0].nftsIds[0]).toBe(nft.id);
    expect(collections[0].nftsIds[1]).toBe(nft2.id);
    expect(collections[0].price).toBe(30);

  });
  it('should get top collections empty', async () => {
    const collections = await service.getTopCollections(null, 0, 1000);

    expect(collections).toBeDefined();
    expect(collections.length).toBe(0);
  });


});
