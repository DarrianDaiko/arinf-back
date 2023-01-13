import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Role } from '../user/role/role.enum';
import { UserRepository } from '../user/user.repository';
import { TeamModel } from './team.model';
import { TeamRepository } from './team.repository';
@Injectable()
export class TeamService {
    //private readonly repository : TeamRepository;
    //private readonly userRepository : UserRepository;

    constructor(//private readonly prisma : PrismaClient,
        private readonly logger: Logger,
        private readonly repository: TeamRepository,
        private readonly userRepository: UserRepository) {
    }

    async createTeam(creatorId: number, data: TeamModel): Promise<TeamModel> {
        if (!data || !data.name || data.balance < 0
            || data.balance == null || data.balance == undefined)
            throw new HttpException("Data is not correct", HttpStatus.BAD_REQUEST);

        if (!await this.userRepository.doesUserExists(creatorId))
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);

        if (await this.repository.doesUserBelongsToATeam(creatorId))
            throw new HttpException("User already has a team", HttpStatus.BAD_REQUEST);

        data.members = [creatorId];
        data.creatorId = creatorId;

        let r = await this.repository.createTeam(data);

        if (!r)
            throw new HttpException("Team could not be created", HttpStatus.NOT_FOUND);

        let u = await this.userRepository.joinTeam(creatorId, r.id);

        if (!u)
            throw new HttpException("User could not be added to the team", HttpStatus.NOT_FOUND);

        return TeamModel.fromEntity(r);
    }

    async updadeTeam(user_id: number, id: number, data: TeamModel): Promise<TeamModel> {

        if (!await this.isUserMemberOfTeamOrAdmin(user_id, id))
            throw new HttpException("User is not a member of the team", HttpStatus.BAD_REQUEST);

        let user = await this.userRepository.getUser(user_id);
        if (data.balance != null && user.role != Role.Admin)
            throw new HttpException("Non admin user cannot update balance", HttpStatus.BAD_REQUEST);

        let r = await this.repository.updateTeam(id, data);

        return TeamModel.fromEntity(r);
    }

    async deleteTeam(user_id: number, id: number): Promise<TeamModel> {

        if (!await this.isUserMemberOfTeamOrAdmin(id, user_id))
            throw new HttpException("User is not a member of the team", HttpStatus.BAD_REQUEST);


        let r = await this.repository.deleteTeam(id);

        if (!r)
            throw new HttpException("Team not found to delete", HttpStatus.NOT_FOUND);

        // Delete all users from the team

        await Promise.all(r.usersId.map(x => this.userRepository.leaveTeam(x)));

        return TeamModel.fromEntity(r);
    }

    async getTeam(id: number): Promise<TeamModel> {
        if (id == null || id == undefined)
            throw new HttpException("Id is not correct", HttpStatus.BAD_REQUEST);
        let r = await this.repository.getTeam(id);

        if (!r)
            throw new HttpException("Team not found", HttpStatus.NOT_FOUND);

        return TeamModel.fromEntity(r);
    }

    async addMember(user_id : number, id: number, newMemberId: number): Promise<TeamModel> {

        if (!await this.userRepository.doesUserExists(user_id))
            throw new HttpException("Request doesnt exists", HttpStatus.NOT_FOUND);
        
        let requester = await this.userRepository.getUser(user_id);
        if (!requester || requester.teamId == null || requester.teamId != id)
            throw new HttpException(
                "User is not a member of the team and henceforth cannot add a new member", HttpStatus.BAD_REQUEST);

        if (!await this.userRepository.doesUserExists(newMemberId))
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);

        if (await this.repository.doesUserBelongsToATeam(newMemberId))
            throw new HttpException("User already has a team", HttpStatus.BAD_REQUEST);


        let r = await this.repository.addMember(id, newMemberId);

        if (!r)
            throw new HttpException("Team not found", HttpStatus.NOT_FOUND);

        let u = await this.userRepository.joinTeam(newMemberId, id);
        if (!u)
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);

        return TeamModel.fromEntity(r);
    }

    async removeMember(id: number, memberId: number): Promise<TeamModel> {

        if (!await this.userRepository.doesUserExists(memberId))
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);

        if (!await this.repository.doesUserBelongsToTeam(memberId, id))
            throw new HttpException("User is not a member of the team", HttpStatus.BAD_REQUEST);

        let r = await this.repository.removeMember(id, memberId);

        if (!r)
            throw new HttpException("Team not found", HttpStatus.NOT_FOUND);

        let u = await this.userRepository.leaveTeam(memberId);

        if (!u)
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);

        return TeamModel.fromEntity(r);
    }

    // Get all non deleted users with pagination
    async getTeams(page: number, limit: number): Promise<TeamModel[]> {
        let r = await this.repository.getTeams(page, limit);
        return r.map(x => TeamModel.fromEntity(x));
    }

    // Get teams with the most sells
    async getTeamsWithMostSells(page: number, limit: number): Promise<TeamModel[]> {

        // We assume teams with a bigger balance are the ones with more sells
        // This is due to the fact only an admin or a sell can add money to the team balance
        let r = await this.repository.getBestSellersTeams(page, limit);
        return r.map(x => TeamModel.fromEntity(x));
    }

    // is the user a member of the team or an admin
    async isUserMemberOfTeamOrAdmin(id: number, userId: number): Promise<boolean> {
        let belongs = await this.repository.doesUserBelongsToTeam(id, userId);
        if (belongs) return true;
        return await this.userRepository.isAdmin(userId);

    }
}