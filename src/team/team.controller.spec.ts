import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { mockUserRep } from '../user/user.mock';
import { UserRepository } from '../user/user.repository';
import { mockTeamRep } from './mock.team';
import { TeamController } from './team.controller';
import { TeamRepository } from './team.repository';
import { TeamService } from './team.service';

let index = 0;
let teamData = [];
let userData = [];

describe('TeamController', () => {
  let controller: TeamController;
  //let service: TeamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [TeamService,
        PrismaClient,
        Logger,
      {
        provide: UserRepository,
        useValue: mockUserRep,
      },
    {
      provide: TeamRepository,
      useValue: mockTeamRep,
    }],
    }).compile();

    //service = module.get<TeamService>(TeamService);
    controller = module.get<TeamController>(TeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    //expect(service).toBeDefined();
  });
});
