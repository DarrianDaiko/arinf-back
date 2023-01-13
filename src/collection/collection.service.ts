import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { NFTStatus, PrismaClient } from '@prisma/client';
import { NFTModel } from '../nft/nft.model';
import { NFTRepository } from '../nft/nft.repository';
import { Role } from '../user/role/role.enum';
import { UserRepository } from '../user/user.repository';
import { CollectionModel, CollectionWithPriceModel } from './collection.model';
import { CollectionRepository } from './collection.repository';

@Injectable()
export class CollectionService {

    constructor(private readonly repository: CollectionRepository,
        private readonly userRepository: UserRepository,
        private readonly nftsRepository: NFTRepository,
        private readonly logger: Logger) {
    }

    async createCollection(creatorId: number, data: CollectionModel): Promise<CollectionModel> {

        if (!data || !data.name || !data.logo || !data.status)
            throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);

        let user = await this.userRepository.getUser(creatorId);
        if (!user)
            throw new HttpException('User not found', 404);

        data.creatorId = creatorId;

        data.nftsIds.forEach(async (nftId) => {
            let nft = await this.nftsRepository.getNFT(nftId);
            if (!nft)
                throw new HttpException('NFT not found', 404);
        });

        let r = await this.repository.createCollection(data);

        if (!r)
            throw new HttpException('Error occured while creating collection', HttpStatus.INTERNAL_SERVER_ERROR);

        return CollectionModel.fromEntity(r);
    }

    async updateCollection(user_id: number, id: number, data: CollectionModel): Promise<CollectionModel> {

        if (user_id == null || id == null || data == null)
            throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);

        let u = await this.userRepository.getUser(user_id);

        if (!u)
            throw new HttpException('User not found', 404);

        let coll = await this.repository.getCollection(id);

        if (!coll)
            throw new HttpException('Collection not found', 404);

        if (coll.creatorId == user_id && coll.status == NFTStatus.ARCHIVED)
            throw new HttpException('Collection is archived', 400);

        if (coll.creatorId != user_id && u.role != Role.Admin)
            throw new HttpException('You are not the owner of this collection', 403);

        await Promise.all(data.nftsIds.map(async (nftId) => {
            let nft = await this.nftsRepository.getNFT(nftId);
            if (!nft)
                throw new HttpException('NFT not found', 404);
        }));

        let r = await this.repository.updateCollection(id, data);

        return CollectionModel.fromEntity(r);
    }

    async deleteCollection(user_id: number, id: number): Promise<CollectionModel> {

        if (!await this.isOwnerOrAdmin(user_id, id))
            throw new HttpException('You are not the owner of this collection', 403);

        let collection = await this.repository.getCollection(id);
        if (!collection)
            throw new HttpException('Collection not found', 404);

        let r = await this.repository.removeCollection(id);

        return CollectionModel.fromEntity(r);
    }

    async getCollection(user_id : number, id: number): Promise<CollectionModel> {

        let u = await this.userRepository.getUser(user_id);

        let r = u ? await this.repository.getCollection(id) : await this.repository.getPublishedCollection(id);

        if (!r)
            throw new HttpException('Collection not found', 404);
        
        if (r.creatorId != user_id && r.status == NFTStatus.ARCHIVED)
            throw new HttpException('You are not the owner of this collection', 403);

        return CollectionModel.fromEntity(r);
    }

    // Get all non deleted users with pagination
    async getCollections(page: number, limit: number): Promise<CollectionModel[]> {
        let r = await this.repository.getCollections(page, limit);
        return r.map(x => CollectionModel.fromEntity(x));
    }

    // Add NFT to Collection
    async addNFTToCollection(collectionId: number, nftId: number): Promise<CollectionModel> {

        let collection = await this.repository.getCollection(collectionId);
        if (!collection)
            throw new HttpException('Collection not found', 404);

        let nft = await this.nftsRepository.getNFT(nftId);
        if (!nft || nft.collectionId != null)
            throw new HttpException('NFT not found', 404);

        if (nft.status == NFTStatus.ARCHIVED)
            throw new HttpException('NFT is archived', 400);

        if (collection.status == NFTStatus.ARCHIVED)
            throw new HttpException('Collection is archived', 400);

        let c = await this.repository.addNFTToCollection(collectionId, nftId);

        if (!c)
            throw new HttpException('Error occured while adding NFT to collection', HttpStatus.INTERNAL_SERVER_ERROR);

        nft.collectionId = collection.id;
        await this.nftsRepository.updateNFT(nft.id, NFTModel.fromEntity(nft));

        return CollectionModel.fromEntity(c);
    }

    // is owner of collection or admin
    async isOwnerOrAdmin(user_id: number, collectionId: number): Promise<boolean> {
        if (user_id == null || collectionId == null) return false;


        let collection = await this.repository.getCollection(collectionId);
        if (!collection) return false;

        let user = await this.userRepository.getUser(user_id);

        if (!user) return false;

        return user.role == Role.Admin || user.id == collection.creatorId;
    }

    // best selling collections
    // We assume the best selling is the one with the highest price
    async getTopCollections(id : number, page: number, limit: number): Promise<CollectionWithPriceModel[]> {

        
        let u = await this.userRepository.getUser(id);


        let r = u ? await this.repository.getCollections(0, undefined) 
        : await this.repository.getPublishedCollections(0, undefined);

        if (!r)
            return [];

        let collectionPrice = [];

        await Promise.all(r.map(async (collection) => {
            let sum = 0;
            await Promise.all(collection.nftsId.map(async nft => {
                let n = await this.nftsRepository.getNFT(nft);
                sum += n.price;

            }));

            collectionPrice.push({ collection: collection, price: sum });

        }));

        // sort by price
        await collectionPrice.sort((a, b) => {

            let aPrice = a.price;
            let bPrice = b.price;

            return bPrice - aPrice;
        });

        // pagination
        collectionPrice = collectionPrice.slice(page, page + limit);

        return collectionPrice.map(x => {
            let c = CollectionWithPriceModel.fromEntity(x.collection)
            c.price = x.price;
            return c;
        });

    }
}
