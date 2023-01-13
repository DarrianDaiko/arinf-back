import { Module, Logger } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
// import { PrismaClient } from '@prisma/client';
import { TeamRepository } from './team.repository';
import { UserRepository } from '../user/user.repository';

@Module({
  providers: [TeamService, TeamRepository, UserRepository, Logger],
  controllers: [TeamController],
  imports: [],
})
export class TeamModule {}
