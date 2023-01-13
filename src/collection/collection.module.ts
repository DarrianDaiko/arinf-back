import { Module, Logger } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../user/user.repository';
import { NFTRepository } from '../nft/nft.repository';
import { CollectionRepository } from './collection.repository';

@Module({
  providers: [CollectionService, PrismaClient, Logger,
  UserRepository, NFTRepository, CollectionRepository],
  controllers: [CollectionController]
})
export class CollectionModule {}
