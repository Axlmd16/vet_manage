import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import type { AuthenticatedUser } from '../types/authenticated-request.js';
import type { SessionProfile, SessionRole } from '../types/session-profile.js';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  // Devuelve el usuario solo si existe y su cuenta está activa.
  async findActiveUser(userId: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, personId: true, status: true },
    });

    return user && user.status === 'ACTIVE' ? { id: user.id, personId: user.personId } : null;
  }

  // Suma los permisos de los roles activos y vigentes del usuario.
  async getPermissionKeys(userId: string): Promise<Set<string>> {
    const now = new Date();
    const permissions = await this.prisma.permission.findMany({
      where: {
        isActive: true,
        rolePermissions: {
          some: {
            role: {
              isActive: true,
              userRoles: {
                some: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
              },
            },
          },
        },
      },
      select: { module: true, action: true },
    });

    return new Set(permissions.map((permission) => `${permission.module}:${permission.action}`));
  }

  // Roles activos y vigentes del usuario.
  async getActiveRoles(userId: string): Promise<SessionRole[]> {
    const now = new Date();
    return this.prisma.role.findMany({
      where: {
        isActive: true,
        userRoles: { some: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } },
      },
      select: { name: true, displayName: true },
      orderBy: { displayName: 'asc' },
    });
  }

  // Datos del usuario con sus roles y permisos vigentes; null si no existe.
  async getSessionProfile(userId: string): Promise<SessionProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mustChangePassword: true,
        person: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!user) return null;

    const [roles, permissions] = await Promise.all([this.getActiveRoles(userId), this.getPermissionKeys(userId)]);

    return {
      mustChangePassword: user.mustChangePassword,
      user: { id: user.id, ...user.person, roles, permissions: [...permissions].sort() },
    };
  }
}
