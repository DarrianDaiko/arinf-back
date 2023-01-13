import { Injectable, Logger } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { NFTStatus } from '@prisma/client';
import { RatingRepository } from '../rating/rating.repository';
import { Role } from '../user/role/role.enum';
import { UserRepository } from '../user/user.repository';
import { NFTModel } from './nft.model';
import { NFTRepository } from './nft.repository';

@Injectable()
export class NftService {

    constructor(
        private readonly logger: Logger,
        private readonly repository: NFTRepository,
        private readonly ratingRepository: RatingRepository,
        private readonly userRepository: UserRepository) {
    }

    // We attribute values to Status to be able to compare them easily
    // Draft < Published < Archived
    private statusToValue(status: NFTStatus): number {
        switch (status) {
            case NFTStatus.DRAFT:
                return 0;
            case NFTStatus.PUBLISHED:
                return 1;
            case NFTStatus.ARCHIVED:
                return 2;
            default:
                return -1;
        }
    }

    // Check if status can be updated in the current state
    // Status can only be updated in this order:
    // DRAFT -> PUBLISH -> ARCHIVE
    private canUpdateStatus(currentStatus: NFTStatus, newStatus: NFTStatus): boolean {
        return this.statusToValue(currentStatus) < this.statusToValue(newStatus);
    }


    async createNFT(creatorId: number, data: NFTModel): Promise<NFTModel> {

        if (!data || !data.name || data.status == null || !data.image
            || data.price == null || data.price < 0) {
            throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);
        }

        let user = await this.userRepository.getUser(creatorId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        data.ownerId = user.id;
        let r = await this.repository.createNFT(data);

        if (!r) {
            throw new HttpException('Error creating NFT', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return NFTModel.fromEntity(r);
    }

    async updateNFT(user_id: number, id: number, data: NFTModel): Promise<NFTModel> {

        if (!this.isOwnerOrAllowed(user_id, id)) {
            throw new HttpException('User is not owner', HttpStatus.UNAUTHORIZED);
        }

        let nft = await this.getNFT(data.ownerId, id);
        if (!nft) {
            throw new HttpException('NFT not found', HttpStatus.NOT_FOUND);
        }
        let currentStatus = nft.status;
        if (data.status && !this.canUpdateStatus(currentStatus, data.status)) {
            throw new HttpException('Invalid status update', HttpStatus.BAD_REQUEST);
        }

        let r = await this.repository.updateNFT(id, data);

        return NFTModel.fromEntity(r);
    }

    async deleteNFT(user_id: number, id: number): Promise<NFTModel> {

        if (id == null || user_id == null || id < 0 || user_id < 0) {
            throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
        }

        if (!await this.isOwnerOrAllowed(user_id, id)) {
            throw new HttpException('User is not owner', HttpStatus.UNAUTHORIZED);
        }

        let r = await this.repository.removeNFT(id);

        if (!r) {
            throw new HttpException('Error deleting NFT', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return NFTModel.fromEntity(r);
    }

    async getNFT(user_id: number, id: number): Promise<NFTModel> {

        if (id == null || id < 0 || user_id < 0) {
            throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
        }

        if (user_id == null) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }
        
        let user = await this.userRepository.getUser(user_id);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        let r = await this.repository.getNFT(id);

        if (!r) {
            throw new HttpException('NFT not found', HttpStatus.NOT_FOUND);
        }

        if (r.ownerId != user.id && user.role != Role.Admin)
            throw new HttpException('User is not owner', HttpStatus.UNAUTHORIZED);

        return NFTModel.fromEntity(r);

    }

    // Get all non deleted users with pagination
    async getNFTs(user_id: number, page: number, limit: number): Promise<NFTModel[]> {

        // if user is not logged in, return only published NFTs

        let r = await this.userRepository.doesUserExists(user_id) 
            ? await this.repository.getNFTs(page, limit)
            : await this.repository.getPublishedNFTs(page, limit);

        if (!r)
            return [];
        return r.map(x => NFTModel.fromEntity(x));
    }

    // is the user the owner of the NFT
    async isOwnerOrAllowed(user_id: number, nft_id: number): Promise<boolean> {

        if (user_id == null || nft_id == null) return false;

        let nft = await this.repository.getNFT(nft_id);

        if (!nft) return false;

        if (nft.ownerId == user_id) return true;

        let user = await this.userRepository.getUser(user_id);
        if (!user || user.role == null || user.role == undefined) return false;

        return user.role == Role.Admin;
    }


}
