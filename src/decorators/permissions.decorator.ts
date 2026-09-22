import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../constants.js';

/**
 * Decorator to attach required permissions to an endpoint or controller.
 * Supports wildcards (e.g. "org:*" will match "org:read").
 */
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
export const Permissions = RequirePermissions;
