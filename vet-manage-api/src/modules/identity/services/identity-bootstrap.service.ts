import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InitialAdminService } from './initial-admin.service.js';
import { RbacCatalogSynchronizer } from './rbac-catalog-synchronizer.service.js';

@Injectable()
export class IdentityBootstrap implements OnModuleInit {
  private readonly logger = new Logger(IdentityBootstrap.name);

  constructor(
    private readonly synchronizer: RbacCatalogSynchronizer,
    private readonly initialAdmin: InitialAdminService,
  ) {}

  // Sincroniza los catálogos y luego garantiza el Administrador inicial.
  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;

    const result = await this.synchronizer.synchronize();
    this.logger.log(
      `RBAC (${this.synchronizer.mode}): ${result.permissionsCreated} permisos creados, ${result.permissionsReactivated} reactivados, `
      + `${result.permissionsDeactivated} desactivados; ${result.rolesCreated} roles creados, `
      + `${result.grantsCreated} asignaciones agregadas, ${result.grantsRevoked} revocadas`,
    );

    if (await this.initialAdmin.ensure()) this.logger.log('Administrador inicial creado');
  }
}
