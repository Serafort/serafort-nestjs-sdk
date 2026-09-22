import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContext } from '@serafort/core';

/**
 * Parameter decorator to inject the authenticated Serafort UserContext or a nested property.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserContext, @CurrentUser('userId') userId: string) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserContext | undefined;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  }
);

/**
 * Parameter decorator to inject the current tenant identifier from the authenticated user context.
 */
export const CurrentTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user?.tenantId;
});
