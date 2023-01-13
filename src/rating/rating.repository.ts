import { PrismaClient, Rating } from "@prisma/client";
import { RatingModel } from "./rating.model";


export class RatingRepository {
    private readonly prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }

    async createRating(data: RatingModel): Promise<Rating> {
        return await this.prisma.rating.create({
            data: {
                nftId: data.nftId,
                userId: data.userId,
                rating: data.rating,

            }
        });
    }

    async updateRating(id: number, data: RatingModel): Promise<Rating> {
        return await this.prisma.rating.update({
            where: { id },
            data
        });
    }

    async removeRating(id: number): Promise<Rating> {
        return await this.prisma.rating.update({
            where: { id },
            data: {}
        });
    }


    async getRating(id: number): Promise<Rating> {
        return await this.prisma.rating.findFirst({
            where: {
                id
            }
        });
    }

    // Get all ratings with pagination order by rating points
    async getRatings(page: number, limit: number): Promise<Rating[]> {
        return await this.prisma.rating.findMany({
            skip: page,
            take: limit,
            orderBy: { rating: 'desc' }
        });
    }


    // Get average rate of nft
    async getAverageRate(nftId: number): Promise<number> {
        let r = await this.prisma.rating.aggregate({
            where: {
                nftId: nftId
            },
            _avg: {
                rating: true
            }
        });

        return r._avg.rating;
    }


    // Get ratings by user id with pagination
    async getRatingsByUserId(userId: number, page: number, limit: number): Promise<Rating[]> {
        return await this.prisma.rating.findMany({
            skip: page,
            take: limit,
            where: {
                userId: userId
            }
        });
    }

    // Get ratings by nft id with pagination
    async getRatingsByNftId(nftId: number, page: number, limit: number): Promise<Rating[]> {
        return await this.prisma.rating.findMany({
            skip: page,
            take: limit,
            where: {
                nftId: nftId
            }
        });
    }

    // check if user has already rated the NFT
    async hasRated(userId: number, nftId: number): Promise<boolean> {
        let r = await this.prisma.rating.findFirst({
            where: {
                userId,
                nftId
            }
        });

        return r != null;
    }

    //Get average rated nfts
    async getAverageRatedNfts(page: number, limit: number): Promise<any[]> {
        let r = await this.prisma.rating.groupBy({
            by: ['nftId'],
            _avg: {
                rating: true
            },
            skip: page,
            take: limit,
            orderBy: { _avg: { rating: 'desc' } }
        });

        return r;
    }

    //Get average rated nfts published
    async getAverageRatedNftsPublished(page: number, limit: number): Promise<any[]> {
        let r = await this.prisma.rating.groupBy({
            by: ['nftId'],
            _avg: {
                rating: true
            },
            skip: page,
            take: limit,
            where: {
                nft: {
                    status: 'PUBLISHED'
                }
            },
            orderBy: { _avg: { rating: 'desc' } }
        });

        return r;
    }


}