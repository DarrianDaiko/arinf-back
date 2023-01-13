import { HttpException } from "@nestjs/common/exceptions";
import { PrismaClient, Team } from "@prisma/client";
import { TeamModel } from "./team.model";

export class TeamRepository
{
    private readonly prisma : PrismaClient;
    constructor() { 

        this.prisma = new PrismaClient();
    }

    async createTeam(data : TeamModel) : Promise<Team> {
        return await this.prisma.team.create({
            data
        });
    }

    async updateTeam(id : number, data : TeamModel) : Promise<Team> {
        return await this.prisma.team.update({
            where: { id },
            data
        });
    }

    async addMember(id : number, memberId : number) : Promise<Team> {
        var team = await this.getTeam(id);

        if (!team)
        {
            throw new HttpException("Team not found", 404);
        }

        // Check if member already exists not to add it twice

        if (team.usersId.includes(memberId))
        {
            throw new HttpException("Member already exists", 400);
        }

        return await this.prisma.team.update({
            where: { id },
            data: { usersId: { push: memberId } }
        });
        
    }

    async removeMember(id : number, memberId : number) : Promise<Team> {
        var team = await this.getTeam(id);
        if (!team)
        {
            throw new HttpException("Team not found", 404);
        }

        // Check if member already exists not to add it twice

        if (!team.usersId.includes(memberId))
        {
            throw new HttpException("Not a member of the team", 400);
        }

        // As there is no way to remove an item from an array in prisma
        // we have to do it manually (see https://github.com/prisma/prisma/discussions/8959)
        team.usersId = team.usersId.filter(x => x != memberId);

        // remove user from the team

        return await this.prisma.team.update({
            where: { id },
            data: { usersId: team.usersId }
        });
    }
    

    async deleteTeam(id : number) : Promise<Team> {
        return await this.prisma.team.update({
            where: { id },
            data: { deletedAt : new Date(Date.now()), usersId: [] }
        });
    }

    async getTeam(id : number) : Promise<Team> {
        return await this.prisma.team.findFirst({
            where: { 
                id,
                deletedAt: undefined
            }
        });
    }

    // Get all non deleted teams with pagination
    async getTeams(page : number, limit : number) : Promise<Team[]> {
        return await this.prisma.team.findMany({
            skip: page,
            take: limit,
            where: { deletedAt: undefined }
        });
    }

    async getTeamByUser(userId : number) : Promise<Team> {
        return await this.prisma.team.findFirst({
            where: {
                usersId: {
                    has: userId
                },
                deletedAt: undefined
            }
        });
    }

    async doesUserBelongsToATeam(userId : number) : Promise<boolean> {
        return await this.prisma.team.count({
            where: {
                usersId: {
                    has: userId
                },
                deletedAt: undefined
            }
        }) > 0;
    }

    async doesUserBelongsToTeam(userId : number, teamId : number) : Promise<boolean> {
        return await this.prisma.team.count({
            where: {
                id: teamId,
                usersId: {
                    has: userId
                },
                deletedAt: undefined
            }
        }) > 0;
    }

    // Get teams whose members are the best sellers with pagination
    async getBestSellersTeams(page : number, limit : number) : Promise<Team[]> {

        // Get teams order by their balance with pagination

        return await this.prisma.team.findMany({
            skip: page,
            take: limit,
            where: { deletedAt: undefined },
            orderBy: { balance: "desc" }
        });


        // Get all teams with their members
        // Get those members who have the most sales
        // Rank them by the quantity they made
        // With pagination

        // let res: any[] = await this.prisma.$queryRaw`
        // SELECT t.id, t.name, t.balance, t."deletedAt", t."usersId"
        // FROM "Team" t
        // INNER JOIN (
        //     SELECT u.id, u.name, u.email, u.password, u."deletedAt", u."teamId", SUM(s.price) as total
        //     FROM "User" u
        //     INNER JOIN "Sell" s ON s."sellerId" = u.id
        //     GROUP BY u.id
        //     ORDER BY total DESC
        // ) u ON u."teamId" = t.id
        // WHERE t."deletedAt" IS NULL
        // LIMIT ${limit}
        // OFFSET ${page}`;

        // return res;

    }
}