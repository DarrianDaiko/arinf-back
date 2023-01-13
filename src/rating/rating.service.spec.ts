import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { NFTStatus } from '@prisma/client';
import { createNFT, mockNFTRep } from '../nft/mock.nft';
import { NFTRepository } from '../nft/nft.repository';
import { createTeam, mockTeamRep } from '../team/mock.team';
import { TeamRepository } from '../team/team.repository';
import { Role } from '../user/role/role.enum';
import { createUser, mockUserRep } from '../user/user.mock';
import { UserRepository } from '../user/user.repository';
import { mockRatingRep } from './rating.mock';
import { RatingModel } from './rating.model';
import { RatingRepository } from './rating.repository';
import { RatingService } from './rating.service';

let index = 0;
describe('RatingService', () => {
  let service: RatingService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RatingService, Logger,
        {
          provide: RatingRepository,
          useValue: mockRatingRep,
        },
        {
          provide: UserRepository,
          useValue: mockUserRep,
        },
        {
          provide: TeamRepository,
          useValue: mockTeamRep,
        },
        {
          provide: NFTRepository,
          useValue: mockNFTRep,
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
  });

  beforeEach(() => {
    index = 0;
    mockNFTRep.nftArray = [];
    mockNFTRep.index = 0;
    mockUserRep.userArray = [];
    mockUserRep.index = 0;
    mockTeamRep.teamArray = [];
    mockTeamRep.index = 0;
    mockRatingRep.ratingArray = [];
    mockRatingRep.index = 0;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a rating', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);
  });

  it('should not create a rating two times', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    try {
      await service.createRating(user2.id, model)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should not be able to rate if not in team', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);


    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user.id;

    try {
      await service.createRating(user2.id, model)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should be able to rate multiple nfts', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const NFT2 = createNFT(mockNFTRep, 1, 'uwu2', 'pic2', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    // create rating model
    const model2 = new RatingModel();

    model2.nftId = NFT2.id;
    model2.rating = 4;
    model2.userId = user2.id;

    const rating2 = await service.createRating(user2.id, model2);

    expect(rating2).toBeDefined();
    expect(rating2.nftId).toBe(NFT2.id);
    expect(rating2.rating).toBe(4);
    expect(rating2.userId).toBe(user2.id);
    expect(mockRatingRep.ratingArray.length).toBe(2);
  });

  it('should not be able to rate null nft', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    try {
      await service.createRating(user2.id, null)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should not be able to rate null user', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    try {
      await service.createRating(null, model)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });
  it('should not be null rating null nft', async () => {

    try {
      await service.createRating(null, null)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });
  it('should not be able to rate nft with wrong id', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = 100;
    model.rating = 3;
    model.userId = user2.id;

    try {
      await service.createRating(user2.id, model)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should be able to update its own rating', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    // create rating model
    const model2 = new RatingModel();

    model2.id = rating.id;
    model2.nftId = NFT.id;
    model2.rating = 4;
    model2.userId = user2.id;

    const rating2 = await service.updateRating(model2.id, model2);

    expect(rating2).toBeDefined();
    expect(rating2.nftId).toBe(NFT.id);
    expect(rating2.rating).toBe(4);
    expect(rating2.userId).toBe(user2.id);
    expect(mockRatingRep.ratingArray.length).toBe(1);
  });

  it('should not be able to update its own rating with bad id', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    // create rating model
    const model2 = new RatingModel();

    model2.nftId = NFT.id + 10;
    model2.rating = 4;
    model2.userId = user2.id;

    try {
      await service.updateRating(model2.id, model2);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });
  it('it should not be able to update null rating', async () => {

    try {
      await service.updateRating(null, null);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });
  it('it should not be able to update null rating id', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    try {
      await service.updateRating(null, rating);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }
  });

  it('should be able to remove rating', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    await service.deleteRating(rating.id);

    expect(mockRatingRep.ratingArray.length).toBe(0);
  });

  it('should be able to remove rating twice', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    await service.deleteRating(rating.id);

    try {
      await service.deleteRating(rating.id);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);

    }

    expect(mockRatingRep.ratingArray.length).toBe(0);
  });
  it('should not be able to remove null rating', async () => {

    try {
      await service.deleteRating(null);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);

    }

    expect(mockRatingRep.ratingArray.length).toBe(0);
  });
  it('should not be able to remove non existing rating', async () => {

    try {
      await service.deleteRating(10);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);

    }

    expect(mockRatingRep.ratingArray.length).toBe(0);
  });

  it('should get rating by id', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    const rating2 = await service.getRating(rating.id);

    expect(rating2).toBeDefined();
    expect(rating2.nftId).toBe(NFT.id);
    expect(rating2.rating).toBe(3);
    expect(rating2.userId).toBe(user2.id);
  });
  it('should get multiple rating by id', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const NFT2 = createNFT(mockNFTRep, 1, 'uwu2', 'pic2', user2.id, 5, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 14, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;


    // create rating model
    const model2 = new RatingModel();

    model2.nftId = NFT2.id;
    model2.rating = 5;
    model2.userId = user.id;

    expect(mockNFTRep.nftArray.length).toBe(2);

    expect(user.id).not.toBe(user2.id);
    expect(NFT.id).not.toBe(NFT2.id);
    expect(NFT.id).toBe(0);
    expect(NFT2.id).toBe(1);
    expect(NFT.ownerId).not.toBe(NFT2.ownerId);

    const rating = await service.createRating(user2.id, model);
    const rating2 = await service.createRating(user.id, model2);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    const rating3 = await service.getRating(rating.id);

    expect(rating3).toBeDefined();
    expect(rating3.nftId).toBe(NFT.id);
    expect(rating3.rating).toBe(3);
    expect(rating3.userId).toBe(user2.id);

    const rating4 = await service.getRating(rating2.id);

    expect(rating4).toBeDefined();
    expect(rating4.nftId).toBe(NFT2.id);
    expect(rating4.rating).toBe(5);
    expect(rating4.userId).toBe(user.id);
  });
  it('should not be able to get rating by id', async () => {

    try {
      await service.getRating(10);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);

    }

    expect(mockRatingRep.ratingArray.length).toBe(0);
  });

  it('should not be able to get rating by id 2', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    try {
      await service.getRating(10);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);

    }

  });
  it('should not get rating by id negative', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 10, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    expect(rating).toBeDefined();
    expect(rating.nftId).toBe(NFT.id);
    expect(rating.rating).toBe(3);
    expect(rating.userId).toBe(user2.id);

    try {
      await service.getRating(-1);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);

    }

    expect(mockRatingRep.ratingArray.length).toBe(1);
  });
  it('should get ratings', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const NFT2 = createNFT(mockNFTRep, 1, 'uwu2', 'pic2', user2.id, 5, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 14, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const model2 = new RatingModel();

    model2.nftId = NFT2.id;
    model2.rating = 5;
    model2.userId = user.id;

    const rating = await service.createRating(user2.id, model);
    const rating2 = await service.createRating(user.id, model2);

    const ratings = await service.getRatings(0, 1000);

    expect(ratings).toBeDefined();
    expect(ratings.length).toBe(2);
    expect(ratings[0].nftId).toBe(NFT.id);
    expect(ratings[0].rating).toBe(3);
    expect(ratings[0].userId).toBe(user2.id);
    expect(ratings[1].nftId).toBe(NFT2.id);
    expect(ratings[1].rating).toBe(5);
    expect(ratings[1].userId).toBe(user.id);

  });

  it('should get ratings which is one', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 14, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const rating = await service.createRating(user2.id, model);

    const ratings = await service.getRatings(0, 1000);

    expect(ratings).toBeDefined();
    expect(ratings.length).toBe(1);
    expect(ratings[0].nftId).toBe(NFT.id);
    expect(ratings[0].rating).toBe(3);
    expect(ratings[0].userId).toBe(user2.id);

  });

  it('should get ratings which is none', async () => {

    const ratings = await service.getRatings(0, 1000);

    expect(ratings).toBeDefined();
    expect(ratings.length).toBe(0);

  });

  it('should get average rated nfts', async () => {

    const user = createUser(mockUserRep, 0, 'test', 'mail', 'addr', 'pass', Role.User);

    const user2 = createUser(mockUserRep, 1, 'test2', 'mail2', 'addr2', 'pass2', Role.User);

    const NFT = createNFT(mockNFTRep, 0, 'uwu', 'pic', user.id, 4, null, NFTStatus.DRAFT);

    const NFT2 = createNFT(mockNFTRep, 1, 'uwu2', 'pic2', user2.id, 5, null, NFTStatus.DRAFT);

    const team = createTeam(mockTeamRep, mockUserRep, 0, 'uwu', 10, [user.id]);

    const team2 = createTeam(mockTeamRep, mockUserRep, 1, 'uwu2', 14, [user2.id]);

    // create rating model
    const model = new RatingModel();

    model.nftId = NFT.id;
    model.rating = 3;
    model.userId = user2.id;

    const model2 = new RatingModel();

    model2.nftId = NFT2.id;
    model2.rating = 5;
    model2.userId = user.id;

    const rating = await service.createRating(user2.id, model);
    const rating2 = await service.createRating(user.id, model2);

    const ratings = await service.getTopRatings(user.id, 0, 1000);

    expect(ratings).toBeDefined();
    expect(ratings.length).toBe(2);
    expect(ratings[1].id).toBe(NFT.id);
    expect(ratings[1].rating).toBe(3);
    expect(ratings[1].ownerId).toBe(user.id);
    expect(ratings[0].id).toBe(NFT2.id);
    expect(ratings[0].rating).toBe(5);
    expect(ratings[0].ownerId).toBe(user2.id);

  });

  it('should get average rated nfts which is empty', async () => {

    const ratings = await service.getTopRatings(null, 0, 1000);

    expect(ratings).toBeDefined();
    expect(ratings.length).toBe(0);

  });

});
