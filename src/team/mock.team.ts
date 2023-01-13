import { TeamModel } from "./team.model";
import { HttpException } from "@nestjs/common";

export const createTeam = (mockTeamRep: any, mockUserRep: any, id: number, name: string, balance: number,
    members: number[]) => {
    let team = {
        id: id,
        name: name,
        balance: balance,
        deletedAt: null,
        usersId: members,
        creatorId: members[0] ? members[0] : null
    }

    mockTeamRep.teamArray.push(team);

    members.forEach((memberId) => {
        let user = mockUserRep.userArray.find((user) => user.id == memberId);
        if (user)
            user.teamId = id;
    });


    return team;
}

export const mockTeamRep = {
    index: 0,
    teamArray: [],

    getLength: jest.fn().mockImplementation(() => {
        return mockTeamRep.teamArray.length;
    }),

    pushTeam: jest.fn().mockImplementation((team) => {
        mockTeamRep.teamArray.push(team);
    }),

    createTeam: jest.fn().mockImplementation(teamData => {
        var mod = teamData as TeamModel;

        if (!mod.name || mod.balance < 0 || !mod.members || mod.creatorId == null)
            throw new HttpException('Missing data', 400);

        let team = {
            id: mockTeamRep.index++,
            name: mod.name,
            balance: mod.balance,
            deletedAt: null,
            usersId: mod.members,
            creatorId: mod.creatorId != null ? mod.creatorId : mod.members[0] ? mod.members[0] : null
        }

        mockTeamRep.teamArray.push(team);

        return team;

    }),
    updateTeam: jest.fn().mockImplementation((id: number, teamData) => {
        let elt = mockTeamRep.teamArray.find((team) => team.id === id);
        if (!elt)
            throw new HttpException('Team not found', 404);
        if (!teamData)
            return elt;
        elt.name = teamData.name ? teamData.name : elt.name;
        elt.balance = teamData.balance ? teamData.balance : elt.balance;
        elt.members = teamData.members ? teamData.members : elt.members;
        return elt;
    }),
    deleteTeam: jest.fn().mockImplementation((id: number) => {
        let elt = mockTeamRep.teamArray.find((team) => team.id == id);
        if (!elt)
            throw new HttpException('Team not found', 404);
        elt.deletedAt = new Date();
        mockTeamRep.teamArray = mockTeamRep.teamArray.filter((team) => team.id !== id);
        return elt;
    }),
    addMember: jest.fn().mockImplementation((id: number, userId: number) => {
        let elt = mockTeamRep.teamArray.find((team) => team.id === id);
        if (!elt)
            throw new HttpException('Team not found', 404);
        elt.usersId.push(userId);
        return elt;
    }),
    removeMember: jest.fn().mockImplementation((id: number, userId: number) => {
        let elt = mockTeamRep.teamArray.find((team) => team.id === id);
        if (!elt)
            throw new HttpException('Team not found', 404);
        elt.usersId = elt.usersId.filter((user) => user !== userId);
        return elt;
    }),

    getTeam: jest.fn().mockImplementation(
        (id: number) => {
            return mockTeamRep.teamArray.find((team) => team.id === id);
        }
    ),
    getTeams: jest.fn().mockImplementation(
        () => {
            return mockTeamRep.teamArray;
        }
    ),
    getTeamByUser: jest.fn().mockImplementation(
        (userId: number) => {
            return mockTeamRep.teamArray.find((team) => team.usersId.includes(userId));
        }
    ),
    doesUserBelongsToATeam: jest.fn().mockImplementation(
        (userId: number) => {
            return mockTeamRep.teamArray.find((team) => team.usersId.includes(userId)) != null;
        }
    ),
    doesUserBelongsToTeam: jest.fn().mockImplementation(
        (userId: number, teamId: number) => {
            
            let teams = mockTeamRep.teamArray.find((team) => team.id == teamId);
            return teams != null && teams.usersId.includes(userId);
        }
    ),
    getBestSellersTeams: jest.fn().mockImplementation(
        (offset, limit) => {
            var teams = mockTeamRep.teamArray;
            teams = teams.sort((a, b) => {
                return b.balance - a.balance;
            }
            );
            return teams.slice(offset, offset + limit);
        }
    ),
};