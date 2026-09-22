import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { SerafortClient } from '@serafort/core';
import { SERAFORT_CLIENT, SERAFORT_OPTIONS } from './constants.js';
import { SerafortModuleOptions, SerafortModuleAsyncOptions, SerafortOptionsFactory } from './types.js';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';

@Global()
@Module({})
export class SerafortModule {
  /**
   * Synchronously registers the SerafortModule.
   */
  static forRoot(options: SerafortModuleOptions): DynamicModule {
    const clientProvider: Provider = {
      provide: SERAFORT_CLIENT,
      useFactory: () => {
        return options.client || new SerafortClient(options);
      },
    };

    const optionsProvider: Provider = {
      provide: SERAFORT_OPTIONS,
      useValue: options,
    };

    return {
      module: SerafortModule,
      global: options.isGlobal ?? true,
      providers: [optionsProvider, clientProvider, AuthGuard, RolesGuard, PermissionsGuard],
      exports: [SERAFORT_CLIENT, SERAFORT_OPTIONS, AuthGuard, RolesGuard, PermissionsGuard],
    };
  }

  /**
   * Asynchronously registers the SerafortModule using a factory, class, or existing provider.
   */
  static forRootAsync(options: SerafortModuleAsyncOptions): DynamicModule {
    const clientProvider: Provider = {
      provide: SERAFORT_CLIENT,
      useFactory: (opts: SerafortModuleOptions) => {
        return opts.client || new SerafortClient(opts);
      },
      inject: [SERAFORT_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: SerafortModule,
      global: options.isGlobal ?? true,
      imports: options.imports || [],
      providers: [...asyncProviders, clientProvider, AuthGuard, RolesGuard, PermissionsGuard],
      exports: [SERAFORT_CLIENT, SERAFORT_OPTIONS, AuthGuard, RolesGuard, PermissionsGuard],
    };
  }

  private static createAsyncProviders(options: SerafortModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    if (options.useClass) {
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    throw new Error('Invalid SerafortModuleAsyncOptions: must provide useFactory, useClass, or useExisting');
  }

  private static createAsyncOptionsProvider(options: SerafortModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: SERAFORT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = options.useExisting ? [options.useExisting] : [options.useClass!];

    return {
      provide: SERAFORT_OPTIONS,
      useFactory: async (optionsFactory: SerafortOptionsFactory) => {
        return optionsFactory.createSerafortOptions();
      },
      inject,
    };
  }
}
