// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
//     if (!requiredRoles) {
//       return true; // No roles required, allow access
//     }

//     const request = context.switchToHttp().getRequest();
//     const user = request.user;

//     return requiredRoles.includes(user.role);
//   }
// }



import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    // return requiredRoles.some((role) => user.userType?.includes(role));
    const hasRole = requiredRoles.some((role) => user.userType?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    return true;
  }
}
