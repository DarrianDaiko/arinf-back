import { Collection, NFTStatus, PrismaClient } from "@prisma/client";

import { CollectionModel } from "./collection.model";

export class CollectionRepository {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }

    async createCollection(data: CollectionModel): Promise<Collection> {
        return await this.prisma.collection.create({
            data: {
                name: data.name,
                logo: data.logo,
                status: data.status,
                creatorId: data.creatorId,
                nftsId: data.nftsIds
            }

        });
    }

    async updateCollection(id: number, data: CollectionModel): Promise<Collection> {
        return await this.prisma.collection.update({
            where: { id },
            data
        });
    }

    async removeCollection(id: number): Promise<Collection> {
        return await this.prisma.collection.update({
            where: { id },
            data: { deletedAt: new Date(Date.now()) }
        });
    }

    // Add NFT to Collection
    async addNFTToCollection(collectionId: number, nftId: number): Promise<Collection> {
        let c = await this.getCollection(collectionId);
        c.nftsId.push(nftId);

        return await this.prisma.collection.update({
            where: { id: collectionId },
            data: { nftsId: c.nftsId }
        });
    }

    async getCollection(id: number): Promise<Collection> {
        return await this.prisma.collection.findFirst({
            where: {
                id,
                deletedAt: undefined
            }
        });
    }

    async getPublishedCollection(id: number): Promise<Collection> {
        return await this.prisma.collection.findFirst({
            where: {
                id,
                status: NFTStatus.PUBLISHED,
                deletedAt: undefined
            }
        });
    }


    async getCollections(page: number, limit: number): Promise<Collection[]> {
        return await this.prisma.collection.findMany({
            skip: page,
            take: limit,
            where: { deletedAt: undefined }
        });
    }


    async getPublishedCollections(page: number, limit: number): Promise<Collection[]> {
        return await this.prisma.collection.findMany({
            skip: page,
            take: limit,
            where: {
                status: NFTStatus.PUBLISHED,
                deletedAt: undefined
            }
        });
    }

    // Get rating according to average rating of nfts
    /*async getTopCollections(page: number, limit: number): Promise<any[]> {


        // Raw query as prisma does not support aggregate on nested relations for now 
        // while trying to paginate
        let res: any[] = await this.prisma.$queryRaw`
            SELECT c.id, c.name, c.logo, c.status, c."creatorName", AVG(r.rating) as averageRating
            FROM "Collection" c
            INNER JOIN "NFT" n ON n."collectionId" = c.id
            INNER JOIN "Rating" r ON r."nftId" = n.id
            WHERE c."deletedAt" IS NULL
            GROUP BY c.id
            ORDER BY averageRating DESC
            OFFSET ${page}
            LIMIT ${limit}
        `;


        return res;
    }*/
}