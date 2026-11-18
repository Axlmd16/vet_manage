import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../../infrastructure/redis/redis.module.js';
import { AuthController } from './auth.controller.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { AccessService } from './services/access.service.js';
import { AuthService } from './services/auth.service.js';
import { IdentityBootstrap } from './services/identity-bootstrap.service.js';
import { InitialAdminService } from './services/initial-admin.service.js';
import { PasswordHasher } from './services/password-hasher.service.js';
import { RbacCatalogSynchronizer } from './services/rbac-catalog-synchronizer.service.js';
import { SessionService } from './services/session.service.js';
import { TokenService } from './services/token.service.js';

@Module({
  imports: [
    RedisModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('auth.jwtSecret') }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RbacCatalogSynchronizer,
    InitialAdminService,
    IdentityBootstrap,
    PasswordHasher,
    TokenService,
    AccessService,
    AuthService,
    SessionService,
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
