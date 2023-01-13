import { Module, Logger } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../user/user.repository';
import { TeamRepository } from '../team/team.repository';
import { NFTRepository } from '../nft/nft.repository';
import { RatingRepository } from './rating.repository';

@Module({
  providers: [RatingService, PrismaClient, Logger, UserRepository,
  TeamRepository, NFTRepository, RatingRepository],
  controllers: [RatingController]
})
export class RatingModule {}
