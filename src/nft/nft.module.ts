import { Logger, Module } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { NFTRepository } from './nft.repository';
import { UserRepository } from '../user/user.repository';
import { RatingRepository } from '../rating/rating.repository';

@Module({
  providers: [NftService, Logger, NFTRepository, UserRepository, RatingRepository],
  controllers: [NftController]
})
export class NftModule {}
