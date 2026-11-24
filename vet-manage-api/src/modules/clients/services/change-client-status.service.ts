import { Injectable } from '@nestjs/common';
import { ApiException } from '../../../common/errors/api-exception.js';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '../../audit/audit.catalog.js';
import { describePerson } from '../../audit/describe-person.js';
import { AuditService } from '../../audit/services/audit.service.js';

export const CLIENT_STATUS_MESSAGES = {
  notFound: 'Cliente no encontrado',
  deactivated: 'No se puede inactivar un cliente dado de baja',
  inactivated: 'Cliente inactivado correctamente',
} as const;

export type InactivatedClientResult = {
  message: string;
  client: {
    id: string;
    status: 'INACTIVE';
  };
};

@Injectable()
export class ChangeClientStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async inactivate(clientId: string, actorId: string): Promise<InactivatedClientResult> {
    await this.prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          status: true,
          person: { select: { identification: true, firstName: true, lastName: true } },
        },
      });

      if (!client) throw ApiException.notFound(CLIENT_STATUS_MESSAGES.notFound);
      if (client.status === 'DEACTIVATED') {
        throw new ApiException(CLIENT_STATUS_MESSAGES.deactivated, 400, [], 'CLIENT_STATUS_DEACTIVATED');
      }
      if (client.status === 'INACTIVE') return;

      await tx.client.update({
        where: { id: clientId },
        data: { status: 'INACTIVE' },
      });

      await this.audit.record(tx, {
        actorId,
        action: AUDIT_ACTIONS.inactivate,
        module: AUDIT_MODULES.clients,
        affectedRecord: describePerson(client.person),
        previousValue: { status: 'Activo' },
        newValue: { status: 'Inactivo' },
      });
    });

    return {
      message: CLIENT_STATUS_MESSAGES.inactivated,
      client: { id: clientId, status: 'INACTIVE' },
    };
  }
}
