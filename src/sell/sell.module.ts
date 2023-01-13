import { Module } from '@nestjs/common';
import { SellService } from './sell.service';
import { SellController } from './sell.controller';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../user/user.repository';
import { TeamRepository } from '../team/team.repository';
import { NFTRepository } from '../nft/nft.repository';
import { SellRepository } from './sell.repository';

@Module({
  providers: [SellService, PrismaClient,
  UserRepository, TeamRepository, NFTRepository, SellRepository],
  controllers: [SellController]
})
export class SellModule {}
