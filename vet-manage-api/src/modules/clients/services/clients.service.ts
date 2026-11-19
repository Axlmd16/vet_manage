import { Injectable } from '@nestjs/common';
import type { ClientListResponseDto, ClientResponseDto, ClientRole } from '../dtos/client-response.dto.js';
import type { ListClientsQueryDto } from '../dtos/list-clients-query.dto.js';
import { ClientsRepository, type ClientWithPerson } from '../repositories/clients.repository.js';

@Injectable()
export class ClientsService {
  constructor(private readonly repository: ClientsRepository) {}

  async list(query: ListClientsQueryDto): Promise<ClientListResponseDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { clients, total } = await this.repository.findClients({
      page,
      pageSize,
      search: query.search,
      status: query.status,
    });

    return {
      items: clients.map((client) => this.toResponse(client)),
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  }

  private toResponse(client: ClientWithPerson): ClientResponseDto {
    const roles = new Map<string, ClientRole>();
    for (const assignment of client.person.user?.userRoles ?? []) {
      roles.set(assignment.role.name, {
        name: assignment.role.name,
        displayName: assignment.role.displayName,
      });
    }

    return {
      id: client.id,
      personId: client.personId,
      identification: client.person.identification,
      firstName: client.person.firstName,
      lastName: client.person.lastName,
      email: client.person.email,
      phone: client.person.phone,
      address: client.person.address,
      status: client.status,
      roles: [...roles.values()].sort((a, b) => a.displayName.localeCompare(b.displayName, 'es')),
      createdAt: client.createdAt.toISOString(),
    };
  }
}
