import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { PasswordHasher } from './password-hasher.service.js';

export const ADMIN_ROLE_NAME = 'administrator';

@Injectable()
export class InitialAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly hasher: PasswordHasher,
  ) {}

  // Crea el Administrador inicial solo si ningún usuario tiene aún el rol. Devuelve si lo creó.
  ensure(): Promise<boolean> {
    return this.prisma.$transaction((tx) => this.ensureWith(tx));
  }

  async ensureWith(tx: Prisma.TransactionClient): Promise<boolean> {
    const role = await tx.role.findUnique({ where: { name: ADMIN_ROLE_NAME } });
    if (!role) throw new Error(`El rol ${ADMIN_ROLE_NAME} no existe; sincronice los catálogos antes`);

    if (await tx.userRole.findFirst({ where: { roleId: role.id }, select: { id: true } })) return false;

    const admin = this.config.getOrThrow<{
      email: string;
      password: string;
      identification: string;
      firstName: string;
      lastName: string;
    }>('initialAdmin');

    const person = await tx.person.findUnique({
      where: { identification: admin.identification },
      include: { user: true },
    }) ?? await tx.person.create({
      data: {
        identification: admin.identification,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
      include: { user: true },
    });

    const user = person.user
      ?? await tx.user.create({ data: { personId: person.id, password: await this.hasher.hash(admin.password) } });
    await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });

    return true;
  }
}
