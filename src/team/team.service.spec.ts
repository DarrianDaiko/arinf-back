import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, User } from '@prisma/client';
import { UserRepository } from '../user/user.repository';
import { TeamRepository } from './team.repository';
import { TeamService } from './team.service';

import { HttpException } from '@nestjs/common/exceptions';
import { createUser, mockUserRep } from '../user/user.mock';
import { mockTeamRep } from './mock.team';
import { UserModel } from '../user/user.model';
import { Role } from '../user/role/role.enum';
import { TeamModel } from './team.model';

let teamData = [];
let userData = [];
let index = 0;


describe('TeamService', () => {
  let service: TeamService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<TeamService>(TeamService);
  });

  beforeEach(() => {
    index = 0;
    userData = [];
    mockUserRep.userArray = userData;
    mockUserRep.index = index;
    teamData = [];
    mockTeamRep.teamArray = teamData;
    mockTeamRep.index = index;
  });



  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    expect(added.id).toBe(0);
    expect(added.name).toEqual('test');
    expect(added.email).toEqual('u');
    expect(added.blockChainAddress).toEqual('a');
    expect(added.password).toEqual('b');
    expect(added.role).toEqual(Role.Admin);
    expect(added.teamId).toBe(null);
    expect(mockUserRep.getLength()).toEqual(1);


    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;


    const team = await service.createTeam(added.id, t);
    expect(team.name).toEqual('testTeam');
    expect(team.balance).toEqual(0);
    expect(team.id).toEqual(0);
    expect(team.creatorId).toEqual(added.id);
    expect(team.members.length).toEqual(1);

    let user = await mockUserRep.getUser(added.id);
    expect(user.teamId).toEqual(team.id);
  });

  it('should not create a team if user does not exist', async () => {
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    try {
      await service.createTeam(0, t);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not create a team if data is missing', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    expect(mockUserRep.getLength()).toEqual(1);
    expect(added.id).toBe(0);
    expect(added.name).toEqual('test');
    expect(added.email).toEqual('u');
    expect(added.blockChainAddress).toEqual('a');
    expect(added.password).toEqual('b');
    expect(added.role).toEqual(Role.Admin);

    // create team model

    const t = new TeamModel();
    // FIELD NOT SET
    t.name = null;
    t.balance = 0;

    try {
      await service.createTeam(added.id, t);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not create a null team', async () => {

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    try {
      await service.createTeam(added.id, null);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not create a null team with a null user', async () => {
    try {
      await service.createTeam(null, null);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should add a member to the team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    expect(added.id).toBe(0);
    expect(added.name).toEqual('test');
    expect(added.email).toEqual('u');
    expect(added.blockChainAddress).toEqual('a');
    expect(added.password).toEqual('b');
    expect(added.role).toEqual(Role.Admin);
    expect(mockUserRep.getLength()).toEqual(1);

    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    // create a user that will be added to the team
    const added2 = createUser(mockUserRep, 0, 'test2', 'w', 'b', 'c', Role.User);
    expect(added2.teamId).toBe(null);

    const team2 = await service.addMember(added.id, team.id, added2.id);
    expect(team2.members.length).toEqual(2);
    expect(team2.name).toEqual(team.name);

    let user = await mockUserRep.getUser(added2.id);
    expect(user.teamId).toEqual(team.id);

  });

  it('should add multiple members to the team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    expect(added.id).toBe(0);
    expect(added.name).toEqual('test');
    expect(added.email).toEqual('u');
    expect(added.blockChainAddress).toEqual('a');
    expect(added.password).toEqual('b');
    expect(added.role).toEqual(Role.Admin);
    expect(mockUserRep.getLength()).toEqual(1);

    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    // create a user that will be added to the team
    const added2 = createUser(mockUserRep, 0, 'test2', 'w', 'b', 'c', Role.User);
    const added3 = createUser(mockUserRep, 0, 'test3', 'x', 'c', 'd', Role.User);
    const added4 = createUser(mockUserRep, 0, 'test4', 'y', 'd', 'e', Role.User);

    const team2 = await service.addMember(added.id, team.id, added2.id);
    const team3 = await service.addMember(added.id, team2.id, added3.id);
    const team4 = await service.addMember(added.id, team3.id, added4.id);

    expect(team4.members.length).toEqual(4);
    expect(team4.name).toEqual(team.name);

  });

  it('should not add someone that already belongs to the team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    expect(added.id).toBe(0);
    expect(added.name).toEqual('test');
    expect(added.email).toEqual('u');
    expect(added.blockChainAddress).toEqual('a');
    expect(added.password).toEqual('b');
    expect(added.role).toEqual(Role.Admin);
    expect(mockUserRep.getLength()).toEqual(1);

    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    try {
      await service.addMember(added.id, team.id, added.id);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not add a member that already belongs to another team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    expect(added.id).toBe(0);
    expect(added.name).toEqual('test');
    expect(added.email).toEqual('u');
    expect(added.blockChainAddress).toEqual('a');
    expect(added.password).toEqual('b');
    expect(added.role).toEqual(Role.Admin);
    expect(mockUserRep.getLength()).toEqual(1);

    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    // create a user that will be added to the team
    const added2 = createUser(mockUserRep, 0, 'test2', 'w', 'b', 'c', Role.User);

    const t2 = new TeamModel();
    t2.name = 'testTeam2';
    t2.balance = 5;

    const team2 = await service.createTeam(added2.id, t2);

    try {
      // second user tries to join another team while already in a team
      await service.addMember(added.id, team.id, added2.id);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not add a member that does not exist', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    expect(added.id).toBe(0);
    expect(added.name).toEqual('test');
    expect(added.email).toEqual('u');
    expect(added.blockChainAddress).toEqual('a');
    expect(added.password).toEqual('b');
    expect(added.role).toEqual(Role.Admin);
    expect(mockUserRep.getLength()).toEqual(1);

    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    try {
      await service.addMember(added.id, team.id, 100);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should update team info', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);
    expect(team.name).toEqual('testTeam');
    expect(team.balance).toEqual(0);

    team.name = 'testTeam2';
    team.balance = 10;

    const team2 = await service.updadeTeam(team.id, team.id, team);

    expect(team2.name).toEqual('testTeam2');
    expect(team2.balance).toEqual(10);
  });
  it('should not update team info if there is no team', async () => {

    try {
      await service.updadeTeam(100, 0, null);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not update team info if the user is not the owner', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);
    expect(team.name).toEqual('testTeam');
    expect(team.balance).toEqual(0);

    team.name = 'testTeam2';
    team.balance = 10;

    const user2 = createUser(mockUserRep, 1, 'test2', 'w', 'c', 'd', Role.User);

    try {
      await service.updadeTeam(user2.id, team.id, team);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should team info if the user is not the owner but an admin', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const admin = createUser(mockUserRep, 1, 'test2', 'w', 'c', 'd', Role.Admin);

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);
    expect(team.name).toEqual('testTeam');
    expect(team.balance).toEqual(0);

    team.name = 'testTeam2';
    team.balance = 10;

    try {
      await service.updadeTeam(admin.id, team.id, team);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not update team info if requester doesnt exists', async () => {
    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);
    expect(team.name).toEqual('testTeam');
    expect(team.balance).toEqual(0);

    team.name = 'testTeam2';
    team.balance = 10;

    try {
      await service.updadeTeam(added.id + 5, team.id, team);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should remove user from team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    // create a user that will be added to the team
    const added2 = createUser(mockUserRep, 1, 'test2', 'w', 'c', 'd', Role.User);

    await service.addMember(added.id, team.id, added2.id);
    expect(team.members.length).toEqual(2);

    const team2 = await service.removeMember(team.id, added2.id);

    expect(team2.members.length).toEqual(1);
  });

  it('should not remove a member that is not from the team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    // create a user that will be added to the team
    const added2 = createUser(mockUserRep, 1, 'test2', 'w', 'c', 'd', Role.User);

    await service.addMember(added.id, team.id, added2.id);
    expect(team.members.length).toEqual(2);

    try {
      await service.removeMember(team.id, added2.id + 5);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not remove member from a team that doesnt exists', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    // create a user that will be added to the team
    const added2 = createUser(mockUserRep, 1, 'test2', 'w', 'c', 'd', Role.User);

    await service.addMember(added.id, team.id, added2.id);
    expect(team.members.length).toEqual(2);

    try {
      await service.removeMember(team.id + 5, added2.id);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not remove from null team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    try {
      await service.removeMember(null, added.id);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });
  it('should not remove a null user', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    try {
      await service.removeMember(team.id, null);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should delete a team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    const teams = await service.deleteTeam(added.id, team.id);
    expect(mockTeamRep.getLength()).toEqual(0);
  });
  it('should not delete a team twice', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    const teams = await service.deleteTeam(added.id, team.id);
    expect(mockTeamRep.getLength()).toEqual(0);

    try {
      await service.deleteTeam(added.id, team.id);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not delete a team if requester doesnt exists', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    try {
      await service.deleteTeam(added.id + 5, team.id);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not delete a team if team doesnt exists', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.Admin);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    try {
      await service.deleteTeam(added.id, team.id + 5);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should delete a team if requester is an admin', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    const admin = createUser(mockUserRep, 1, 'test1', 'u1', 'a1', 'b1', Role.Admin);

    const teams = await service.deleteTeam(admin.id, team.id);
    expect(mockTeamRep.getLength()).toEqual(0);
  });

  it('should not delete a team if requester is not a member of the team', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    const user2 = createUser(mockUserRep, 1, 'test1', 'u1', 'a1', 'b1', Role.User);

    try {
      await service.deleteTeam(user2.id, team.id);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should get team by id', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    const team2 = await service.getTeam(team.id);
    expect(team2).toEqual(team);
  });

  it('should not get team by id if team doesnt exists', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    try {
      await service.getTeam(team.id + 5);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should not get team if team is null', async () => {
    try {
      await service.getTeam(null);
    }
    catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
  });

  it('should get all teams', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);

    const teams = await service.getTeams(0, 10000);
    expect(teams.length).toEqual(1);
  });


  it('should get all teams 2', async () => {
    // create a user that will create the team

    const added = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    // create team model

    const t = new TeamModel();
    t.name = 'testTeam';
    t.balance = 0;

    const team = await service.createTeam(added.id, t);


    // create a second user

    const added2 = createUser(mockUserRep, 1, 'test2', 'u2', 'a2', 'b2', Role.User);

    // create a second team

    const t2 = new TeamModel();
    t2.name = 'testTeam2';
    t2.balance = 0;

    const team2 = await service.createTeam(added2.id, t2);

    const teams = await service.getTeams(0, 10000);
    expect(teams.length).toEqual(2);
  });

  it('get teams order by sells', async () => {
    // create a bunch of users

    const user1 = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);
    const user2 = createUser(mockUserRep, 1, 'test2', 'u2', 'a2', 'b2', Role.User);
    const user3 = createUser(mockUserRep, 2, 'test3', 'u3', 'a3', 'b3', Role.User);
    const user4 = createUser(mockUserRep, 3, 'test4', 'u4', 'a4', 'b4', Role.User);
    const user5 = createUser(mockUserRep, 4, 'test5', 'u5', 'a5', 'b5', Role.User);

    // create a bunch of teams

    const t1 = new TeamModel();
    t1.name = 'testTeam1';
    t1.balance = 0;

    const team1 = await service.createTeam(user1.id, t1);

    const t2 = new TeamModel();
    t2.name = 'testTeam2';
    t2.balance = 20;

    const team2 = await service.createTeam(user2.id, t2);

    const t3 = new TeamModel();
    t3.name = 'testTeam3';
    t3.balance = 5;

    const team3 = await service.createTeam(user3.id, t3);

    const t4 = new TeamModel();
    t4.name = 'testTeam4';
    t4.balance = 10;

    const team4 = await service.createTeam(user4.id, t4);

    const t5 = new TeamModel();
    t5.name = 'testTeam5';
    t5.balance = 15;

    const team5 = await service.createTeam(user5.id, t5);

    let teams = await service.getTeamsWithMostSells(0, 10000);

    expect(teams.length).toEqual(5);
    expect(teams[0].id).toEqual(team2.id);
    expect(teams[1].id).toEqual(team5.id);
    expect(teams[2].id).toEqual(team4.id);
    expect(teams[3].id).toEqual(team3.id);
    expect(teams[4].id).toEqual(team1.id);
  });

  it('get team order by sells ', async () => {
    // create a bunch of users

    const user1 = createUser(mockUserRep, 0, 'test', 'u', 'a', 'b', Role.User);

    // create a bunch of teams

    const t1 = new TeamModel();
    t1.name = 'testTeam1';
    t1.balance = 0;

    const team1 = await service.createTeam(user1.id, t1);

    let team = await service.getTeamsWithMostSells(0, 10);

    expect(team.length).toEqual(1);
    expect(team[0].id).toEqual(team1.id);
  });

  it('should get none team by sells', async () => {

    let team = await service.getTeamsWithMostSells(0, 10);

    expect(team.length).toEqual(0);
  });
});

