import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants.js';

/**
 * Decorator to attach required roles to an endpoint or controller.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
