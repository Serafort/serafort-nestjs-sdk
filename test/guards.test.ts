import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '../src/guards/auth.guard.js';
import { RolesGuard } from '../src/guards/roles.guard.js';
import { PermissionsGuard } from '../src/guards/permissions.guard.js';
import { SerafortClient } from '@serafort/core';
import { IS_PUBLIC_KEY, ROLES_KEY, PERMISSIONS_KEY } from '../src/constants.js';

describe('NestJS Guards', () => {
  const mockClient = {
    b2b: {
      validateToken: vi.fn(),
      hasPermission: vi.fn(),
    },
  } as unknown as SerafortClient;

  const createMockContext = (headers: Record<string, string> = {}, user?: any): ExecutionContext => {
    const request = { headers, user };
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
    } as unknown as ExecutionContext;
  };

  describe('AuthGuard', () => {
    it('should bypass authentication when endpoint is @Public()', async () => {
      const reflector = new Reflector();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const guard = new AuthGuard(reflector, mockClient);
      const ctx = createMockContext({});

      const canActivate = await guard.canActivate(ctx);
      expect(canActivate).toBe(true);
    });

    it('should throw UnauthorizedException when no Authorization header is present', async () => {
      const reflector = new Reflector();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const guard = new AuthGuard(reflector, mockClient);
      const ctx = createMockContext({});

      await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should validate token and attach user to request', async () => {
      const reflector = new Reflector();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const mockUser = {
        userId: 'usr_nest_1',
        tenantId: 'ten_nest',
        roles: ['admin'],
        permissions: ['read:all'],
        claims: {},
      };

      vi.mocked(mockClient.b2b.validateToken).mockResolvedValueOnce(mockUser);

      const guard = new AuthGuard(reflector, mockClient);
      const ctx = createMockContext({ authorization: 'Bearer nest_jwt_token' });

      const canActivate = await guard.canActivate(ctx);
      expect(canActivate).toBe(true);

      const req = ctx.switchToHttp().getRequest();
      expect(req.user).toEqual(mockUser);
      expect(req.auth.userId).toBe('usr_nest_1');
    });
  });

  describe('RolesGuard', () => {
    it('should allow access if user has required role', () => {
      const reflector = new Reflector();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const guard = new RolesGuard(reflector);
      const ctx = createMockContext({}, { roles: ['admin', 'member'] });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw ForbiddenException if user lacks required role', () => {
      const reflector = new Reflector();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const guard = new RolesGuard(reflector);
      const ctx = createMockContext({}, { roles: ['member'] });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('PermissionsGuard', () => {
    it('should allow access if user has required permissions', () => {
      const reflector = new Reflector();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['org:read']);

      vi.mocked(mockClient.b2b.hasPermission).mockReturnValue(true);

      const guard = new PermissionsGuard(reflector, mockClient);
      const ctx = createMockContext({}, { permissions: ['org:read'] });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw ForbiddenException if user lacks permission', () => {
      const reflector = new Reflector();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['org:write']);

      vi.mocked(mockClient.b2b.hasPermission).mockReturnValue(false);

      const guard = new PermissionsGuard(reflector, mockClient);
      const ctx = createMockContext({}, { permissions: ['org:read'] });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });
});
