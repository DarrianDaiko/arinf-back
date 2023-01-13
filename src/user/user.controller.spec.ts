import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import * as sinon from 'sinon';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { PrismaClient } from '@prisma/client';
import { mockUserRep } from './user.mock';

let data = [];
let index = 0;
describe('UserController', () => {
  let controller: UserController;
  let service : UserService;


  let sandbox: sinon.SinonSandbox;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        PrismaClient,
        Logger,
        {
          provide: UserRepository,
          useValue: mockUserRep,
        }
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  })

  beforeEach(async () => {
    data = []
    index = 0
    mockUserRep.userArray = data;
    mockUserRep.index = index;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
