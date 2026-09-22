import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SerafortClient } from '@serafort/core';
import { PERMISSIONS_KEY, SERAFORT_CLIENT } from '../constants.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(SERAFORT_CLIENT) private readonly client: SerafortClient
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Forbidden: Unauthenticated user cannot be evaluated for permissions.');
    }

    // Must satisfy all specified permissions
    for (const perm of requiredPermissions) {
      const hasPerm = this.client.b2b.hasPermission(user, perm);
      if (!hasPerm) {
        throw new ForbiddenException(`Forbidden: Missing required permission "${perm}".`);
      }
    }

    return true;
  }
}
