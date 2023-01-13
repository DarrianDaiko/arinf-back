import { PrismaClient, Sell } from "@prisma/client";
import { SellModel } from "./sell.model";
import { Logger } from "@nestjs/common";

export class SellRepository
{
    private readonly prisma : PrismaClient;

    constructor(private readonly logger : Logger) { 

        this.prisma = new PrismaClient();

        // LOGGING INSERTION

        this.prisma.$use(async (params, next) => {
            
            const result = await next(params)

            if (params.action == 'create')
            {
                const before = Date.now();
              
                const after = Date.now();
              
                logger.log(`Query ${params.model}.${params.action} took ${after - before}ms`)

                
                logger.log(`Sell : \n
                id : ${result.id} \n
                price : ${result.price} \n
                timestamp : ${result.deletedAt} \n
                seller : ${result.sellerId} \n
                buyer : ${result.buyerId} \n
                nft : ${result.nftId} \n`);
                
                return result;
            }

            return result;
          
          })
          
    }
    async createSell(data : SellModel) : Promise<Sell> {
        return await this.prisma.sell.create({
            data : {
                nftId : data.nftId,
                buyerId : data.buyerId,
                sellerId : data.sellerId,
                price : data.price,
            }

        });
    }

    async updateSell(id : number, data : SellModel) : Promise<Sell> {
        return await this.prisma.sell.update({
            where: { id },
            data
        });
    }

    async removeSell(id : number) : Promise<Sell> {
        return await this.prisma.sell.update({
            where: { id },
            data: { }
        });
    }


    async getSell(id : number) : Promise<Sell> {
        return await this.prisma.sell.findFirst({
            where: { 
                id
            }
        });
    }

    // Get all sells with pagination order by price
    async getSells(page : number, limit : number) : Promise<Sell[]> {
        return await this.prisma.sell.findMany({
            skip: page,
            take: limit,
            orderBy: { price: 'desc' }
        });
    }

    // Get sells by user id with pagination
    async getSellsByUserId(userId : number, page : number, limit : number) : Promise<Sell[]> {
        return await this.prisma.sell.findMany({
            skip: page,
            take: limit,
            where: {
                sellerId: userId
            }
        });
    }

    // Get buys by user id with pagination
    async getBuysByUserId(userId : number, page : number, limit : number) : Promise<Sell[]> {
        return await this.prisma.sell.findMany({
            skip: page,
            take: limit,
            where: {
                buyerId: userId
            }
        });
    }

    // Get last sells with pagination
    async getLastSells(page : number, limit : number) : Promise<Sell[]> {
        return await this.prisma.sell.findMany({
            skip: page,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
    }


}