import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants.js';

/**
 * Decorator to mark an endpoint or controller as publicly accessible, bypassing AuthGuard.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
