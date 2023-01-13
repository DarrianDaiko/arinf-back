import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient, User } from '@prisma/client';
import { ROLES_KEY } from './role.decorator';
import { Role } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {

  private prisma: PrismaClient = new PrismaClient();
  constructor(private reflector: Reflector) {}

  private matchRoles(requiredRoles: Role[], user: User) {
    return requiredRoles.some((role) => user.role?.includes(role));
    }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    const properUser = this.prisma.user.findFirst({
        where: {
            id: user.id,
            deletedAt: undefined
        }
    });

    if (!properUser) {
        return false;
    }

    return user && this.matchRoles(requiredRoles, user);
  }
}
