import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmail } from 'class-validator';
import { ApiException } from '../../../common/errors/api-exception.js';
import { isValidIdentification } from '../../../common/validation/identification.js';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { MailService } from '../../../infrastructure/mail/mail.service.js';
import { renderCredentialsEmail } from '../../../infrastructure/mail/templates/credentials-email.js';
import type { ClientRegistrationDto, ClientResponseDto } from '../dtos/client-registration.dto.js';
import { PasswordHasher } from './password-hasher.service.js';
import { generateTemporaryPassword } from './temporary-password.js';

export const CLIENT_MESSAGES = {
  registered: 'Cliente registrado correctamente',
  mailFailed: 'Cliente registrado, pero no se pudo enviar el correo. Verifique la dirección y reenvíe las credenciales',
  missing: 'Complete los campos obligatorios',
  invalidIdentification: 'La cédula debe tener 10 dígitos válidos',
  invalidEmail: 'Ingrese un correo electrónico válido',
  invalidPhone: 'Ingrese un teléfono válido',
  invalidName: 'Los nombres y apellidos no pueden superar 100 caracteres',
  invalidRoles: 'Seleccione roles válidos del personal',
  invalidAddress: 'Dirección no válida',
  identificationTaken: 'Número de cédula ya registrado',
  emailTaken: 'El correo ya se encuentra registrado',
} as const;

const PHONE_PATTERN = /^\+?\d{7,15}$/;
const NAME_MAX = 100;
const EMAIL_MAX = 255;
const ADDRESS_MAX = 255;

export type RegisteredClient = {
  id: string;
  personId: string;
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: string;
  roles: { name: string; displayName: string }[];
  existingPerson: boolean;
  passwordAssigned: boolean;
  credentialsSent: boolean;
};

export type ClientRegistrationResult = { message: string; client: RegisteredClient };

type ValidInput = {
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  roleNames: string[];
};

type StaffRole = { id: string; name: string; displayName: string };

@Injectable()
export class ClientRegistrationService {
  private readonly logger = new Logger(ClientRegistrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  // Roles activos del personal que se pueden asignar al registrar un cliente.
  listAssignableRoles() {
    return this.prisma.role.findMany({
      where: { isActive: true, category: 'STAFF' },
      select: { name: true, displayName: true, description: true },
      orderBy: { displayName: 'asc' },
    });
  }

  async register(input: ClientRegistrationDto, assignedById: string): Promise<ClientRegistrationResult> {
    const data = this.validate(input);
    const roles = await this.findStaffRoles(data.roleNames);

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await this.hasher.hash(temporaryPassword);

    let outcome: Awaited<ReturnType<ClientRegistrationService['persist']>>;
    try {
      outcome = await this.prisma.$transaction((tx) => this.persist(tx, data, roles, passwordHash, assignedById));
    } catch (error) {
      throw this.translateConflict(error);
    }

    const { person, user, passwordAssigned, existingPerson } = outcome;
    const credentialsSent = passwordAssigned
      ? await this.sendCredentials(person, roles, user.id, temporaryPassword)
      : false;

    return {
      message: passwordAssigned && !credentialsSent ? CLIENT_MESSAGES.mailFailed : CLIENT_MESSAGES.registered,
      client: {
        id: user.id,
        personId: person.id,
        identification: person.identification,
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email,
        phone: person.phone,
        address: person.address,
        status: user.status,
        roles: roles.map(({ name, displayName }) => ({ name, displayName })),
        existingPerson,
        passwordAssigned,
        credentialsSent,
      },
    };
  }

  private async findStaffRoles(names: string[]): Promise<StaffRole[]> {
    const roles = await this.prisma.role.findMany({
      where: { name: { in: names }, isActive: true, category: 'STAFF' },
      select: { id: true, name: true, displayName: true },
    });
    if (roles.length !== names.length) throw new ApiException(CLIENT_MESSAGES.invalidRoles, 400, [], 'CLIENT_INVALID_ROLES');
    return roles;
  }

  private async persist(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    data: ValidInput,
    roles: StaffRole[],
    passwordHash: string,
    assignedById: string,
  ) {
    const now = new Date();
    const found = await tx.person.findUnique({
      where: { identification: data.identification },
      include: {
        user: {
          include: {
            userRoles: {
              where: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }], role: { isActive: true } },
              select: { role: { select: { category: true } } },
            },
          },
        },
      },
    });

    if (found?.user?.userRoles.some(({ role }) => role.category === 'STAFF')) {
      throw new ApiException(CLIENT_MESSAGES.identificationTaken, 409, [], 'CLIENT_IDENTIFICATION_TAKEN');
    }

    if (!found) {
      const emailOwner = await tx.person.findFirst({
        where: { email: { equals: data.email, mode: 'insensitive' } },
        select: { id: true },
      });
      if (emailOwner) throw new ApiException(CLIENT_MESSAGES.emailTaken, 409, [], 'CLIENT_EMAIL_TAKEN');
    }

    const person = found ?? await tx.person.create({
      data: {
        identification: data.identification,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    const select = { id: true, status: true } as const;
    let user: { id: string; status: string };
    let passwordAssigned = true;
    if (!found?.user) {
      user = await tx.user.create({ data: { personId: person.id, password: passwordHash, mustChangePassword: true }, select });
    } else if (!found.user.password) {
      user = await tx.user.update({ where: { id: found.user.id }, data: { password: passwordHash, mustChangePassword: true }, select });
    } else {
      user = found.user;
      passwordAssigned = false;
    }

    await this.assignRoles(tx, user.id, roles, assignedById, now);

    return { person, user, passwordAssigned, existingPerson: Boolean(found) };
  }

  private async assignRoles(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    userId: string,
    roles: StaffRole[],
    assignedById: string,
    now: Date,
  ) {
    const existing = await tx.userRole.findMany({
      where: { userId, roleId: { in: roles.map((role) => role.id) } },
      select: { id: true, roleId: true, expiresAt: true },
    });
    const byRole = new Map(existing.map((assignment) => [assignment.roleId, assignment]));

    for (const role of roles) {
      const assignment = byRole.get(role.id);
      if (!assignment) {
        await tx.userRole.create({ data: { userId, roleId: role.id, assignedById } });
      } else if (assignment.expiresAt && assignment.expiresAt <= now) {
        await tx.userRole.update({ where: { id: assignment.id }, data: { expiresAt: null, assignedById } });
      }
    }
  }

  private async sendCredentials(
    person: { firstName: string; lastName: string; email: string },
    roles: StaffRole[],
    userId: string,
    password: string,
  ): Promise<boolean> {
    try {
      const baseUrl = this.config.get<string>('app.url') ?? '';
      const { subject, text, html } = renderCredentialsEmail({
        ...person,
        password,
        roles: roles.map((role) => role.displayName),
        loginUrl: `${baseUrl.replace(/\/$/, '')}/login`,
      });
      await this.mail.send({ to: person.email, subject, text, html });
      return true;
    } catch (error) {
      this.logger.warn(`No se pudieron enviar las credenciales del cliente ${userId}: ${(error as Error).message}`);
      return false;
    }
  }

  private validate(input: ClientRegistrationDto): ValidInput {
    const identification = input.identification?.trim() ?? '';
    const firstName = input.firstName?.trim() ?? '';
    const lastName = input.lastName?.trim() ?? '';
    const email = input.email?.trim().toLowerCase() ?? '';
    const phone = input.phone?.trim() || null;
    const address = input.address?.trim() || null;
    const roleNames = [...new Set((input.roles ?? []).map((name) => name.trim()).filter(Boolean))];

    const missing = [
      !identification && 'identification',
      !firstName && 'firstName',
      !lastName && 'lastName',
      !email && 'email',
      roleNames.length === 0 && 'roles',
    ].filter((field): field is string => Boolean(field));
    if (missing.length > 0) throw new ApiException(CLIENT_MESSAGES.missing, 400, missing, 'CLIENT_MISSING_FIELDS');

    if (!isValidIdentification(identification)) {
      throw new ApiException(CLIENT_MESSAGES.invalidIdentification, 400, ['identification'], 'CLIENT_INVALID_IDENTIFICATION');
    }
    if (email.length > EMAIL_MAX || !isEmail(email)) {
      throw new ApiException(CLIENT_MESSAGES.invalidEmail, 400, ['email'], 'CLIENT_INVALID_EMAIL');
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
      throw new ApiException(CLIENT_MESSAGES.invalidPhone, 400, ['phone'], 'CLIENT_INVALID_PHONE');
    }
    if (address && address.length > ADDRESS_MAX) {
      throw new ApiException(CLIENT_MESSAGES.invalidAddress, 400, ['address'], 'CLIENT_INVALID_ADDRESS');
    }
    if (firstName.length > NAME_MAX || lastName.length > NAME_MAX) {
      throw new ApiException(CLIENT_MESSAGES.invalidName, 400, ['firstName', 'lastName'], 'CLIENT_INVALID_NAME');
    }

    return { identification, firstName, lastName, email, phone, address, roleNames };
  }

  private translateConflict(error: unknown): unknown {
    if (typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002') {
      const detail = JSON.stringify((error as { meta?: unknown }).meta ?? '').toLowerCase();
      return detail.includes('email')
        ? new ApiException(CLIENT_MESSAGES.emailTaken, 409, [], 'CLIENT_EMAIL_TAKEN')
        : new ApiException(CLIENT_MESSAGES.identificationTaken, 409, [], 'CLIENT_IDENTIFICATION_TAKEN');
    }
    return error;
  }
}
