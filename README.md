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

## Development

```bash
pnpm install
pnpm run type-check   # tsc --noEmit
pnpm run test         # vitest
pnpm run build        # tsup
```

## Contributing

Before committing, changes are checked with `pnpm run type-check`. This is
wired up two ways — pick whichever fits your setup:

- **Husky (npm-idiomatic, default for contributors who run `pnpm install`)**:
  the `prepare` script installs a Husky hook automatically, so once you've run
  `pnpm install` in a git checkout, `git commit` runs the check for you.
- **`.githooks/` (portable, no Husky/Node required to install)**: run
  `git config core.hooksPath .githooks` once to point git directly at the
  checked-in `.githooks/pre-commit` script, which runs the same check.

Both hooks run the same command, so pick one — you don't need both active.

CI (`.github/workflows/ci.yml`) runs `type-check`, `test`, and `build` on
every push to `main` and on pull requests.
