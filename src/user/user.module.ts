import { Module, NestModule, MiddlewareConsumer, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaClient } from '@prisma/client';
import { LoggerMiddleware } from '../logger.middleware';
import { UserRepository } from './user.repository';

@Module({
  providers: [UserService, PrismaClient, Logger, UserRepository],
  controllers: [UserController],
  imports: [],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('user');
  }
}