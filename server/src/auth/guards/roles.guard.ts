import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../user/entities/user.entity';

type AuthenticatedUser = {
  userId: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
};

type RequestWithUser = {
  user?: AuthenticatedUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (user?.role === Role.THERAPIST && user.mustChangePassword) {
      throw new ForbiddenException(
        'Change your temporary password before using the therapist dashboard',
      );
    }

    return Boolean(user && requiredRoles.includes(user.role));
  }
}
