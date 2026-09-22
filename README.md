# @serafort/nestjs

NestJS dynamic module for Serafort B2B authentication, multi-tenant resolution, and local RBAC guards.

## Installation

```bash
npm install @serafort/nestjs @serafort/core
```

## Setup

In your `AppModule`:

```typescript
import { Module } from '@nestjs/common';
import { SerafortModule } from '@serafort/nestjs';

@Module({
  imports: [
    SerafortModule.forRoot({
      endpoint: 'https://auth.acme.com',
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

## Controller Usage

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  RolesGuard,
  PermissionsGuard,
  CurrentUser,
  CurrentTenant,
  Roles,
  RequirePermissions,
  Public,
} from '@serafort/nestjs';
import { UserContext } from '@serafort/core';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  @Get('public-info')
  @Public()
  getPublicInfo() {
    return { status: 'public' };
  }

  @Get('me')
  getProfile(@CurrentUser() user: UserContext, @CurrentTenant() tenantId: string) {
    return { user, tenantId };
  }

  @Post('admin-action')
  @UseGuards(RolesGuard)
  @Roles('admin')
  performAdminAction() {
    return { status: 'admin action performed' };
  }

  @Post('billing/invoice')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('billing:write')
  createInvoice() {
    return { invoice: 'created' };
  }
}
```
