import { Module, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, UserService, UserRepository, PrismaClient, Logger],
  exports: [AuthService],
})
export class AuthModule {}
