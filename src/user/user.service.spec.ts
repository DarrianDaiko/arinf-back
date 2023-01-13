import { Logger } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { Role } from './role/role.enum';
import { mockUserRep } from './user.mock';
import { UserModel } from './user.model';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';


let data = [];
let index = 0;

describe('UserService', () => {
  let service: UserService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        PrismaClient,
        Logger,
        {
          provide: UserRepository,
          useValue: mockUserRep,
        }
      ],
    })
      .compile();
    service = module.get<UserService>(UserService);
  })

  beforeEach(() => {
    data = [];
    index = 0;
    mockUserRep.userArray = data;
    mockUserRep.index = index;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
  });

  it('should create regular user even though an admin has been passed', async () => {
      
      const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
      const model = new UserModel();
      model.email = 'test';
      model.name = 'user';
      model.blockchainAddress = addr;
      model.role = Role.Admin;
  
      const user = await service.createUser(model);
      expect(user).toBeDefined();
      expect(user.email).toBe('test');
      expect(user.name).toBe('user');
      expect(user.blockchainAddress).toBe(addr);
      expect(user.role).toBe(Role.User.toString());
  });

  it('should not create user with empty data', async () => {

    const model = new UserModel();

    // no data
    try {
      await service.createUser(model)
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not create user with empty email', async () => {

    const model = new UserModel();
    model.name = 'user';
    model.blockchainAddress = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';

    // no email
    try {
      await service.createUser(model)
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not create user with empty blockchainAddress', async () => {

    const model = new UserModel();
    model.name = 'user';
    model.email = 'test';

    // no blockchainAddress
    try {
      await service.createUser(model)
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not create user with non unique email', async () => {

    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';

    await service.createUser(model);

    const model2 = new UserModel();
    model2.email = 'test';
    model2.name = 'user2';
    model2.blockchainAddress = '0x93437f371ecbFac8a1B5CD24D8B6aEBE70dda4fb';

    // duplicate email
    try {
      await service.createUser(model2)
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not create user with null', async () => {

    const model = null;
    try {
      await service.createUser(model)
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  }
  );

  it('should not create user with undefined', async () => {

    const model = undefined;
    try {
      await service.createUser(model)
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should update user', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    const model2 = new UserModel();
    model2.email = 'test2';
    model2.name = 'user2';
    model2.blockchainAddress = addr;
    model2.role = Role.Admin.toString();

    const user2 = await service.updateUser(user.id, user.id, model2);
    expect(user2).toBeDefined();
    expect(user2.email).toBe('test2');
    expect(user2.name).toBe('user2');
    expect(user2.blockchainAddress).toBe(addr);
    expect(user2.role).toBe(Role.Admin.toString());
    expect(mockUserRep.getLength()).toBe(1);
  });

  it('should not update user with empty data', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    const model2 = new UserModel();

    const user2 = await service.updateUser(user.id, user.id, model2);
    expect(user2).toBeDefined();
    expect(user2.email).toBe('test');
    expect(user2.name).toBe('user');
    expect(user2.blockchainAddress).toBe(addr);
    expect(user2.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

  });

  it('should not update user with whose another and not an admin', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    const model2 = new UserModel();
    model2.email = 'test2';
    model2.name = 'user2';
    model2.blockchainAddress = addr;
    model2.role = Role.Admin.toString();

    try {
      await service.updateUser(100000, user.id, model2);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }

  });

  it('should not update user with null', async () => {

    const model = null;
    try {
      await service.updateUser(1, 1, model)
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not update user with undefined', async () => {

    const model = undefined;
    try {
      await service.updateUser(1, 1, model)
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should update because requester is an admin', async () => {

    // first insert an admin

    data.push({
      id: 1,
      email: 'test0',
      name: 'user0',
      blockchainAddress: '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb',
      role: Role.Admin.toString()
    })
    expect(mockUserRep.getLength()).toBe(1);

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(2);

    const model2 = new UserModel();
    model2.email = 'test2';
    model2.name = 'user2';
    model2.blockchainAddress = addr;
    model2.role = Role.Admin.toString();

    const user2 = await service.updateUser(1, user.id, model2);
    expect(user2).toBeDefined();
    expect(user2.email).toBe('test2');
    expect(user2.name).toBe('user2');
    expect(user2.blockchainAddress).toBe(addr);
    expect(user2.role).toBe(Role.Admin.toString());
    expect(mockUserRep.getLength()).toBe(2);
  });

  it('should not update user with empty data because requester is an admin', async () => {

    // first insert an admin

    data.push({
      id: 1,
      email: 'test0',
      name: 'user0',
      blockchainAddress: '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb',
      role: Role.Admin.toString()
    })
    expect(mockUserRep.getLength()).toBe(1);

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(2);

    const model2 = new UserModel();

    const user2 = await service.updateUser(1, user.id, model2);
    expect(user2).toBeDefined();
    expect(user2.email).toBe('test');
    expect(user2.name).toBe('user');
    expect(user2.blockchainAddress).toBe(addr);
    expect(user2.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(2);

  });

  it('should get user by id', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    const user2 = await service.getUser(user.id, user.id);
    expect(user2).toBeDefined();
    expect(user2.email).toBe('test');
    expect(user2.name).toBe('user');
    expect(user2.blockchainAddress).toBe(addr);
    expect(user2.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);
  });

  it('should not get user by id because requester is not the user', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    try {
      await service.getUser(100000, user.id);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not get user by id because requester is not an admin', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    // create second regular user

    const model2 = new UserModel();
    model2.email = 'test2';
    model2.name = 'user2';
    model2.blockchainAddress = addr;
    model2.role = Role.User.toString();

    const user2 = await service.createUser(model2);

    try {
      await service.getUser(user2.id, user.id);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not get user as no user matches the id', async () => {
    // still create a user so we are sure it will not match the id
    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    try {
      await service.getUser(user.id + 1, user.id);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not get user as there is no user at all', async () => {
    try {
      await service.getUser(1, 1);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should get all users which is one', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    const users = await service.getUsers(10, 0);
    expect(users).toBeDefined();
    expect(users.length).toBe(1);
    expect(users[0].email).toBe('test');
    expect(users[0].name).toBe('user');
    expect(users[0].blockchainAddress).toBe(addr);
    expect(users[0].role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);
  });

  it('should get all users which is two', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    // create second regular user

    const model2 = new UserModel();
    model2.email = 'test2';
    model2.name = 'user2';
    model2.blockchainAddress = addr;
    model2.role = Role.User.toString();

    const user2 = await service.createUser(model2);

    const users = await service.getUsers(10, 0);
    expect(users).toBeDefined();
    expect(users.length).toBe(2);
    expect(users[0].email).toBe('test');
    expect(users[0].name).toBe('user');
    expect(users[0].blockchainAddress).toBe(addr);
    expect(users[0].role).toBe(Role.User.toString());
    expect(users[1].email).toBe('test2');
    expect(users[1].name).toBe('user2');
    expect(users[1].blockchainAddress).toBe(addr);
    expect(users[1].role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(2);
  });
  it('it should get all users which is empty list', async () => {
    const users = await service.getUsers(10, 0);
    expect(users).toBeDefined();
    expect(users.length).toBe(0);
  });

  it('should not get all users because of wrong page size', async () => {
    try {
      await service.getUsers(-1, 0);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not get all users because of wrong page number', async () => {

    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);


    let users = await service.getUsers(10, 1);

    expect(users).toBeDefined();
    expect(users.length).toBe(0);
  });

  it('should get user by email', async () => {
    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    const user2 = await service.getByEmail('test');
    expect(user2).toBeDefined();
    expect(user2.email).toBe('test');
    expect(user2.name).toBe('user');
    expect(user2.blockchainAddress).toBe(addr);
    expect(user2.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);
  });

  it('should not get user by email bc no user matches', async () => {
    try {
      await service.getByEmail('test');
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should delete user', async () => {
    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    await service.deleteUser(user.id, user.id);
    expect(mockUserRep.getLength()).toBe(0);
  });

  it('should not delete user because of wrong id', async () => {
    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;

    const user = await service.createUser(model);
    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    try {
      await service.deleteUser(user.id, user.id +1);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }

  });

  it('should delete user bc requester is an admin', async () => {
    const addr = '0x83437f371ecbFac8a1B5CD24D8B6aEBE70dda2fb';
    const model = new UserModel();
    model.email = 'test';
    model.name = 'user';
    model.blockchainAddress = addr;
    model.role = Role.User.toString();
    
    const user = await service.createUser(model);

    expect(user).toBeDefined();
    expect(user.email).toBe('test');
    expect(user.name).toBe('user');
    expect(user.blockchainAddress).toBe(addr);
    expect(user.role).toBe(Role.User.toString());
    expect(mockUserRep.getLength()).toBe(1);

    // create admin for requester
    const adminModel = new UserModel();
    adminModel.id = 1000000;
    adminModel.email = 'test2';
    adminModel.name = 'adm';
    adminModel.blockchainAddress = addr;
    adminModel.role = Role.Admin.toString();

    mockUserRep.pushUser(adminModel);

    expect(mockUserRep.getLength()).toBe(2);

    await service.deleteUser(adminModel.id, user.id);
    expect(mockUserRep.getLength()).toBe(1);
  } );

});
