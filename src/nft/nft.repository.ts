import { NFT, NFTStatus, PrismaClient } from "@prisma/client";
import { NFTModel } from "./nft.model";

export class NFTRepository {

    private readonly prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }

    async createNFT(data: NFTModel): Promise<NFT> {
        return await this.prisma.nFT.create({
            data: {
                name: data.name,
                image: data.image,
                price: data.price,
                ownerId: data.ownerId,
                collectionId: data.collectionId,
                status: data.status
            }

        });
    }

    async updateNFT(id: number, data: NFTModel): Promise<NFT> {
        return await this.prisma.nFT.update({
            where: { id },
            data
        });
    }

    async removeNFT(id: number): Promise<NFT> {
        return await this.prisma.nFT.update({
            where: { id },
            data: { deletedAt: new Date(Date.now()) }
        });
    }


    async getNFT(id: number): Promise<NFT> {
        return await this.prisma.nFT.findFirst({
            where: {
                id,
                deletedAt: undefined
            }
        });
    }

    async getPublishedNFT(id: number): Promise<NFT> {
        return await this.prisma.nFT.findFirst({
            where: {
                id,
                status: NFTStatus.PUBLISHED,
                deletedAt: undefined
            }
        });
    }

    // Get all non deleted nfts with pagination
    async getNFTs(page: number, limit: number): Promise<NFT[]> {
        return await this.prisma.nFT.findMany({
            skip: page,
            take: limit,
            where: { deletedAt: undefined }
        });
    }

    // Get all non deleted nfts which are published with pagination

    async getPublishedNFTs(page: number, limit: number): Promise<NFT[]> {
        return await this.prisma.nFT.findMany({
            skip: page,
            take: limit,
            where: {
                status: NFTStatus.PUBLISHED,
                deletedAt: undefined
            }
        });
    }


    // Does NFT belongs to user
    async isOwner(id: number, userId: number): Promise<boolean> {
        let r = await this.prisma.nFT.findFirst({
            where: {
                id,
                ownerId: userId,
                deletedAt: undefined
            }
        });

        return r != null;

    }

    // Get NFTs by collection id

    async getNFTsByCollectionId(collectionId: number, page: number, limit: number): Promise<NFT[]> {
        return await this.prisma.nFT.findMany({
            skip: page,
            take: limit,
            where: {
                collectionId : collectionId,
                deletedAt: undefined
            }
        });
    }
}