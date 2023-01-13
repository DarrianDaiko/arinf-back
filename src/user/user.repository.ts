import { Logger } from "@nestjs/common";
import { PrismaClient, User } from "@prisma/client";

import { Role } from "./role/role.enum";
import { UserModel } from "./user.model";

export class UserRepository
{
    private readonly prisma : PrismaClient;
    constructor(
        private readonly logger : Logger) { 
        // LOGGING INSERTION

        this.prisma = new PrismaClient();

        this.prisma.$use(async (params, next) => {
            
            const result = await next(params)
            if (params.action == 'create')
            {

                const before = Date.now();
              
                const after = Date.now();
              
                this.logger.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
         
                this.logger.log(`New user : \n
                id : ${result.id} \n
                email : ${result.email} \n
                timestamp : ${result.deletedAt} \n
                role : ${result.sellerId} \n`);
                
                return result;
            }

            return result;
          
          })
    }

    async createUser(data : UserModel) : Promise<User> {
        return await this.prisma.user.create({
            data : {
                email: data.email,
                name: data.name,
                password: data.password,
                blockChainAddress: data.blockchainAddress,
                role: data.role
            }
        });
    }

    async updateUser(id : number, data : UserModel) : Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data
        });
    }

    async deleteUser(id : number) : Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data: { deletedAt : new Date(Date.now()) }
        });
    }

    async getUser(id : number) : Promise<User> {
        return await this.prisma.user.findFirst({
            where: { 
                id,
                deletedAt: undefined
            }
        });
    }

    async getByEmail(email : string) : Promise<User> {
        return await this.prisma.user.findFirst({
            where: {
                email,
                deletedAt: undefined
            }
        });
    }


    async doesUserExists(id : number) : Promise<boolean> {
        return (await this.getUser(id)) != null;
    }

    // Get all non deleted users with pagination
    async getUsers(page : number, limit : number) : Promise<User[]> {
        return await this.prisma.user.findMany({
            skip: page,
            take: limit,
            where: { deletedAt: undefined }
        });
    }

    // Leave team

    async leaveTeam(id : number) : Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data: { teamId: null }
        });
    }

    // Join team
    async joinTeam(id : number, teamId : number) : Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data: { teamId }
        });
    };

    // is user an admin
    async isAdmin(id : number) : Promise<boolean> {
        let u = await this.getUser(id);
        if (!u) return false;
        return u.role == Role.Admin;
    }

}