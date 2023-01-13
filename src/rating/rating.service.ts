import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { NFTModel, NFTWithRatingModel } from '../nft/nft.model';
import { NFTRepository } from '../nft/nft.repository';
import { TeamRepository } from '../team/team.repository';
import { UserRepository } from '../user/user.repository';
import { RatingModel } from './rating.model';
import { RatingRepository } from './rating.repository';

@Injectable()
export class RatingService {

    constructor(
        private readonly logger: Logger,
        private readonly userRepository: UserRepository,
        private readonly teamRepository: TeamRepository,
        private readonly nftRepository: NFTRepository,
        private readonly repository: RatingRepository) {
    }

    async createRating(creatorId: number, data: RatingModel): Promise<RatingModel> {

        if (!data || creatorId == null)
            throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);

        let user = await this.userRepository.getUser(creatorId);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        let nft = await this.nftRepository.getNFT(data.nftId);
        if (!nft) {
            throw new HttpException('NFT not found', HttpStatus.NOT_FOUND);
        }

        if (user.teamId == null) {
            throw new HttpException('User is not in a team', HttpStatus.BAD_REQUEST);
        }


        let team = await this.teamRepository.getTeam(user.teamId);

        if (!team) {
            throw new HttpException('User does not belong to a team', HttpStatus.NOT_FOUND);
        }

        // Check if the team owns the NFT
        await Promise.all(team.usersId.map(async userId => {
            if (await this.nftRepository.isOwner(nft.id, userId))
                throw new HttpException('Cannot rate a NFT from your own team', HttpStatus.BAD_REQUEST);
                
        }));

        let r = await this.repository.createRating(data);

        if (!r) {
            throw new HttpException('Could not create rating', HttpStatus.INTERNAL_SERVER_ERROR);
        }


        return RatingModel.fromEntity(r);
    }

    async updateRating(id: number, data: RatingModel): Promise<RatingModel> {

        if (!data || id == null)
            throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);
        
        let rating = await this.repository.getRating(id);
        if (!rating) {
            throw new HttpException('Rating not found', HttpStatus.NOT_FOUND);
        }

        let r = await this.repository.updateRating(id, data);
        if (!r) {
            throw new HttpException('Could not update rating', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return RatingModel.fromEntity(r);
    }

    async deleteRating(id: number): Promise<RatingModel> {

        let r = await this.repository.removeRating(id);

        return RatingModel.fromEntity(r);
    }

    async getRating(id: number): Promise<RatingModel> {
        let r = await this.repository.getRating(id);

        return RatingModel.fromEntity(r);
    }

    async getRatings(page: number, limit: number): Promise<RatingModel[]> {
        let r = await this.repository.getRatings(page, limit);

        return r.map(RatingModel.fromEntity);
    }

    // check if user has already rated the NFT
    async hasRated(userId: number, nftId: number): Promise<boolean> {
        if (userId == null || nftId == null)
            throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);

        let r = await this.repository.hasRated(userId, nftId);
        return r;
    }

    // check if user can rate the NFT
    async canRate(userId: number, nftId: number): Promise<boolean> {
        if (userId == null || nftId == null) return false;

        let user = await this.userRepository.getUser(userId);
        if (!user) return false;

        if (await this.hasRated(userId, nftId)) return false;

        return true;

    }

    // get top average ratings
    async getTopRatings(userId : number, page: number, limit: number): Promise<NFTWithRatingModel[]> {
        

        let nfts_with_score = await this.userRepository.doesUserExists(userId)
        ? await this.repository.getAverageRatedNfts(page, limit)
        : await this.repository.getAverageRatedNftsPublished(page, limit);

        if (!nfts_with_score) 
            return [];
        
        // get the NFTs
        let nfts = await Promise.all(nfts_with_score.map(async n => {
            return await this.nftRepository.getNFT(n.nftId);
        }));

        let models = nfts.map(nft => NFTWithRatingModel.fromEntity(nft));

        models.forEach((model, index) => {
            model.rating = nfts_with_score[index]._avg.rating;
        });

        return models;
    }


}
