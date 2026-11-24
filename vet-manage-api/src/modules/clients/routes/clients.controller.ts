import { Controller, Get, Param, ParseUUIDPipe, Patch, Query, Req } from '@nestjs/common';
import { ApiException } from '../../../common/errors/api-exception.js';
import { success } from '../../../common/errors/api-response.js';
import { RequirePermissions } from '../../identity/decorators/require-permissions.decorator.js';
import type { AuthenticatedRequest } from '../../identity/types/authenticated-request.js';
import { ListClientsQueryDto } from '../dtos/list-clients-query.dto.js';
import { ChangeClientStatusService } from '../services/change-client-status.service.js';
import { ClientsService } from '../services/clients.service.js';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clients: ClientsService,
    private readonly statusChange: ChangeClientStatusService,
  ) {}

  @Get()
  @RequirePermissions('clients:read')
  async list(@Query() query: ListClientsQueryDto) {
    return success(await this.clients.list(query));
  }

  @Get(':clientId/pets')
  @RequirePermissions('pets:read')
  async listPets(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return success(await this.clients.listPets(clientId));
  }

  @Patch(':clientId/inactivate')
  @RequirePermissions('clients:inactivate')
  async inactivate(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!request.user) throw ApiException.unauthorized();
    const { message, client } = await this.statusChange.inactivate(clientId, request.user.id);
    return success(client, message);
  }
}
