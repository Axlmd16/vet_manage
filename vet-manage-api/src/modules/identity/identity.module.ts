import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { AccessService } from './services/access.service.js';
import { IdentityBootstrap } from './services/identity-bootstrap.service.js';
import { InitialAdminService } from './services/initial-admin.service.js';
import { PasswordHasher } from './services/password-hasher.service.js';
import { RbacCatalogSynchronizer } from './services/rbac-catalog-synchronizer.service.js';
import { TokenService } from './services/token.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('auth.jwtSecret') }),
    }),
  ],
  providers: [
    RbacCatalogSynchronizer,
    InitialAdminService,
    IdentityBootstrap,
    PasswordHasher,
    TokenService,
    AccessService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    RbacCatalogSynchronizer,
    InitialAdminService,
    PasswordHasher,
    TokenService,
    AccessService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
})
export class IdentityModule {}
