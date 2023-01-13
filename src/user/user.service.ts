import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NFTModel } from '../nft/nft.model';
import { NFTRepository } from '../nft/nft.repository';
import { SellModel } from '../sell/sell.model';
import { SellRepository } from '../sell/sell.repository';
import { TeamModel } from '../team/team.model';
import { TeamRepository } from '../team/team.repository';
import { Role } from './role/role.enum';
import { UserModel } from './user.model';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {

    //private readonly repository : UserRepository;
    private readonly nftRepository: NFTRepository;
    private readonly teamRepository: TeamRepository;
    private readonly sellRepository: SellRepository;

    private saltRounds = 10;

    private bcrypt = require('bcrypt');

    constructor(private readonly prisma: PrismaClient,
        private readonly logger: Logger,
        private readonly repository: UserRepository) {
        //this.repository = new UserRepository(prisma, logger);
    }

    private isValidBlockChainAddress(address: string): boolean {

        var exp = /^0x[a-fA-F0-9]{40}$/;
        var regex = new RegExp(exp);

        return regex.test(address);
    }

    private getRandomString(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }



    async createUser(data: UserModel): Promise<UserModel> {

        // Check if data content provided
        if (!data || !data.blockchainAddress || !data.email || !data.name)
            throw new HttpException(`Missing data`, HttpStatus.BAD_REQUEST);

        if (!this.isValidBlockChainAddress(data.blockchainAddress)) {
            throw new HttpException(`Invalid blockchain address ${data.blockchainAddress}`, HttpStatus.BAD_REQUEST);
        }

        // Generate a random password that we will send back to user
        // It is not secured but it is just used as a project example
        data.role = Role.User;
        data.password = this.getRandomString(10);
        let pwd = data.password;

        // Hash the password using bcrypt algorithm with 10 (see above) salt rounds.
        // This step is a bit ridiculous because we are hashing a random password
        // that was are sending back to the client so there is no proper security.
        // What should be done is to never send the password back to the client
        // and just let them decide what they want.
        // Issue is for this project purpose we want to know the password.
        // This could be undone in the future but this is just a project example.

        data.password = await this.bcrypt.hash(data.password, this.saltRounds);
        let r = await this.repository.createUser(data);
        // Send it back to user, this is a really bad practice
        r.password = pwd;
        return UserModel.fromEntity(r);

    }

    async updateUser(requesterId: number, id: number, data: UserModel): Promise<UserModel> {

        if (!data)
            throw new HttpException("Missing data", HttpStatus.BAD_REQUEST);

        // Check if requester is admin or if requester is the user
        if (!await this.repository.isAdmin(requesterId) && requesterId != id)
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

        if (data.blockchainAddress && !this.isValidBlockChainAddress(data.blockchainAddress))
            throw new HttpException("Invalid blockchain address", HttpStatus.BAD_REQUEST);

        // Hashing password if updated by user
        data.password = data.password ? await this.bcrypt.hash(data.password, this.saltRounds) : undefined;

        let r = await this.repository.updateUser(id, data);

        return UserModel.fromEntity(r);
    }

    async deleteUser(requesterId: number, id: number): Promise<UserModel> {

        // Check if requester is admin or if requester is the user
        if (await this.repository.isAdmin(requesterId) == false && requesterId != id)
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

        let r = await this.repository.deleteUser(id);

        return UserModel.fromEntity(r);
    }

    async getUser(requesterId: number, id: number): Promise<UserModel> {
        // Check if requester is admin or if requester is the user
        if (await this.repository.isAdmin(requesterId) == false && requesterId != id)
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

        let r = await this.repository.getUser(id);
        return UserModel.fromEntity(r);
    }

    async getByEmail(email: string): Promise<UserModel> {
        let r = await this.repository.getByEmail(email);
        return UserModel.fromEntity(r);
    }

    // Get all non deleted users with pagination
    async getUsers(page: number, limit: number): Promise<UserModel[]> {
        let r = await this.repository.getUsers(page, limit);

        return r.map(x => UserModel.fromEntity(x));
    }

    // User sell a NFT to another user
    /*
    async sellNFT(id: number, nftId: number, sellerId: number,
        buyerId: number, price: number): Promise<SellModel> {

        if (buyerId == sellerId)
            throw new HttpException("Buyer and seller cannot be the same", HttpStatus.BAD_REQUEST);

        let nft = await this.nftRepository.getNFT(nftId);

        if (!nft || nft.ownerId != sellerId)
            throw new HttpException("No matching NFT found owned by user", HttpStatus.BAD_REQUEST);

        let buyTeam = await this.teamRepository.getTeam(buyerId);
        if (!buyTeam)
            throw new HttpException("Buyer team not found", HttpStatus.BAD_REQUEST);
        if (buyTeam.balance < price)
            throw new HttpException("Buyer team does not have enough balance", HttpStatus.BAD_REQUEST);

        let sellTeam = await this.teamRepository.getTeam(sellerId);
        if (!sellTeam)
            throw new HttpException("Seller team not found", HttpStatus.BAD_REQUEST);

        let sell = await this.sellRepository.createSell({
            nftId: nftId,
            sellerId: sellerId,
            buyerId: buyerId,
            price: price
        });

        if (!sell)
            throw new HttpException("Sell not created", HttpStatus.BAD_REQUEST);

        // Update NFT owner
        nft.ownerId = buyerId;
        await this.nftRepository.updateNFT(nftId, NFTModel.fromEntity(nft));

        // Update buyer team balance
        buyTeam.balance -= price;
        await this.teamRepository.updateTeam(buyerId, TeamModel.fromEntity(buyTeam));

        // Update seller team balance
        sellTeam.balance += price;
        await this.teamRepository.updateTeam(sellerId, TeamModel.fromEntity(sellTeam));


        return SellModel.fromEntity(sell);
    }*/
}
