import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SerafortClient, AuthenticationError } from '@serafort/core';
import { IS_PUBLIC_KEY, SERAFORT_CLIENT } from '../constants.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(SERAFORT_CLIENT) private readonly client: SerafortClient
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header with Bearer token.');
    }

    const token = authHeader.substring(7).trim();

    try {
      const user = await this.client.b2b.validateToken(token);

      request.user = user;
      request.auth = {
        userId: user.userId,
        tenantId: user.tenantId,
        roles: user.roles,
        permissions: user.permissions,
      };

      return true;
    } catch (err: unknown) {
      const message = err instanceof AuthenticationError ? (err as AuthenticationError).message : 'Invalid or expired token.';
      throw new UnauthorizedException(message);
    }
  }
}
