import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { NFTModel } from '../nft/nft.model';
import { NFTRepository } from '../nft/nft.repository';
import { TeamModel } from '../team/team.model';
import { TeamRepository } from '../team/team.repository';
import { UserRepository } from '../user/user.repository';
import { SellModel } from './sell.model';
import { SellRepository } from './sell.repository';

@Injectable()
export class SellService {

    constructor(private readonly repository: SellRepository,
        private readonly userRepository: UserRepository,
        private readonly nftRepository: NFTRepository,
        private readonly teamRepository: TeamRepository) {
    }

    async createSell(data: SellModel): Promise<SellModel> {
        if (!data || data.price == null || data.price <= 0)
            throw new HttpException("Invalid data", HttpStatus.BAD_REQUEST);

        let seller = await this.userRepository.getUser(data.sellerId);
        let buyer = await this.userRepository.getUser(data.buyerId);

        if (!seller || !buyer)
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);

        let nft = await this.nftRepository.getNFT(data.nftId);
        
        if (!nft || nft.ownerId != seller.id)
            throw new HttpException("NFT invalid", HttpStatus.BAD_REQUEST);

        let teamBuyer = await this.teamRepository.getTeam(buyer.teamId);
        let teamSeller = await this.teamRepository.getTeam(seller.teamId);

        if (!teamBuyer || !teamSeller)
            throw new HttpException("Team not found", HttpStatus.NOT_FOUND);

        if (teamBuyer.id == teamSeller.id)
            throw new HttpException("Cannot sell to your own team", HttpStatus.BAD_REQUEST);

        if (teamBuyer.balance < data.price)
            throw new HttpException("Not enough balance", HttpStatus.BAD_REQUEST);

        nft.previousOwnersId.push(nft.ownerId);

        nft = await this.nftRepository.updateNFT(nft.id, NFTModel.fromEntity(nft));

        if (!nft)
            throw new HttpException("Could not update NFT", HttpStatus.INTERNAL_SERVER_ERROR);

        let r = await this.repository.createSell(data);

        if (!r)
            throw new HttpException("Could not create sell", HttpStatus.INTERNAL_SERVER_ERROR);

        nft.ownerId = buyer.id;
        teamBuyer.balance -= data.price;
        teamSeller.balance += data.price;
        await this.nftRepository.updateNFT(nft.id, NFTModel.fromEntity(nft));
        await this.teamRepository.updateTeam(teamBuyer.id, TeamModel.fromEntity(teamBuyer));
        await this.teamRepository.updateTeam(teamSeller.id, TeamModel.fromEntity(teamSeller));

        return SellModel.fromEntity(r);
    }

    // Will only suppress the sell from the logs, there wont be any refund
    /* async removeSell(id: number): Promise<SellModel> {
         if (id == null)
             throw new HttpException("Invalid id", HttpStatus.BAD_REQUEST);
 
         let r = await this.repository.removeSell(id);
         
         if (!r)
             throw new HttpException("Could not remove sell", HttpStatus.INTERNAL_SERVER_ERROR);
         return SellModel.fromEntity(r);
     }*/

    async getSell(id: number): Promise<SellModel> {
        if (id == null)
            throw new HttpException("Invalid id", HttpStatus.BAD_REQUEST);
        let r = await this.repository.getSell(id);
        if (!r)
            throw new HttpException("Sell not found", HttpStatus.NOT_FOUND);
        return SellModel.fromEntity(r);
    }

    async getSells(offset: number, limit: number): Promise<SellModel[]> {
        let r = await this.repository.getSells(offset, limit);
        if (!r) 
            return [];

        return r.map(x => SellModel.fromEntity(x));
    }

    // get last sells
    async getLastSells(offset: number, limit: number): Promise<SellModel[]> {
        let r = await this.repository.getLastSells(offset, limit);
        if (!r)
            return [];
        return r.map(x => SellModel.fromEntity(x));
    }

    // get own sells
    async getOwnSells(id: number, offset: number, limit: number): Promise<SellModel[]> {
        let r = await this.repository.getSellsByUserId(id, offset, limit);
        if (!r)
            return [];
        return r.map(x => SellModel.fromEntity(x));
    }

}
