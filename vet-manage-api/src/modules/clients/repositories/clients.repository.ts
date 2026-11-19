import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import type { ClientStatus } from '../dtos/client-response.dto.js';
import type { ListClientsQueryDto } from '../dtos/list-clients-query.dto.js';

export type ClientWithPerson = {
  id: string;
  personId: string;
  status: ClientStatus;
  createdAt: Date;
  person: {
    identification: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    user: {
      userRoles: { role: { name: string; displayName: string } }[];
    } | null;
  };
};

export type ClientSearchResult = { clients: ClientWithPerson[]; total: number };

const CLIENT_ROLE_NAME = 'client';

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findClients(query: ListClientsQueryDto): Promise<ClientSearchResult> {
    const now = new Date();
    const search = query.search?.trim();
    const activeClientRole = {
      role: { name: CLIENT_ROLE_NAME, isActive: true },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    } satisfies Prisma.UserRoleWhereInput;

    const where = {
      ...(query.status ? { status: query.status } : {}),
      person: {
        user: { userRoles: { some: activeClientRole } },
        ...(search
          ? {
              OR: [
                { identification: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    } satisfies Prisma.ClientWhereInput;

    const [clients, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        include: {
          person: {
            include: {
              user: {
                include: {
                  userRoles: {
                    where: {
                      role: { isActive: true },
                      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
                    },
                    select: { role: { select: { name: true, displayName: true } } },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ person: { lastName: 'asc' } }, { person: { firstName: 'asc' } }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.client.count({ where }),
    ]);

    return { clients, total };
  }

  // Datos mínimos para que otros dominios validen al cliente (HU-07).
  findById(id: string): Promise<{ id: string; status: ClientStatus } | null> {
    return this.prisma.client.findUnique({ where: { id }, select: { id: true, status: true } });
  }
}
