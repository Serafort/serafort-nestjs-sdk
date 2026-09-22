export { SerafortModule } from './serafort.module.js';
export { SERAFORT_CLIENT, SERAFORT_OPTIONS, IS_PUBLIC_KEY, ROLES_KEY, PERMISSIONS_KEY } from './constants.js';

// Guards
export { AuthGuard } from './guards/auth.guard.js';
export { RolesGuard } from './guards/roles.guard.js';
export { PermissionsGuard } from './guards/permissions.guard.js';

// Decorators
export { Public } from './decorators/public.decorator.js';
export { CurrentUser, CurrentTenant } from './decorators/current-user.decorator.js';
export { Roles } from './decorators/roles.decorator.js';
export { RequirePermissions, Permissions } from './decorators/permissions.decorator.js';

// Types
export type {
  SerafortModuleOptions,
  SerafortModuleAsyncOptions,
  SerafortOptionsFactory,
} from './types.js';
