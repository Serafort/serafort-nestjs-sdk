import { ModuleMetadata, Type } from '@nestjs/common';
import { SerafortConfig, SerafortClient } from '@serafort/core';

export interface SerafortModuleOptions extends SerafortConfig {
  /** If provided, uses this pre-instantiated client */
  client?: SerafortClient;
  /** Global default for whether auth guard is optional */
  isGlobal?: boolean;
}

export interface SerafortOptionsFactory {
  createSerafortOptions(): Promise<SerafortModuleOptions> | SerafortModuleOptions;
}

export interface SerafortModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<SerafortOptionsFactory>;
  useClass?: Type<SerafortOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<SerafortModuleOptions> | SerafortModuleOptions;
  inject?: any[];
  isGlobal?: boolean;
}
