import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TeamModule } from './team/team.module';
import { NftModule } from './nft/nft.module';
import { RatingModule } from './rating/rating.module';
import { SellModule } from './sell/sell.module';
import { CollectionModule } from './collection/collection.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, TeamModule, NftModule, RatingModule, SellModule, CollectionModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
