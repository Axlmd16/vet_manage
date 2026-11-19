import { Body, Controller, Get, HttpCode, Post, Query, Req } from '@nestjs/common';
import { ApiException } from '../../common/errors/api-exception.js';
import { success } from '../../common/errors/api-response.js';
import { RequirePermissions } from './decorators/require-permissions.decorator.js';
import { QueryUsersDto } from './dtos/query-users.dto.js';
import { RegisterUserDto } from './dtos/register-user.dto.js';
import { UserQueryService } from './services/user-query.service.js';
import { UserRegistrationService } from './services/user-registration.service.js';
import type { AuthenticatedRequest } from './types/authenticated-request.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly registration: UserRegistrationService,
    private readonly query: UserQueryService,
  ) {}

  @Get()
  @RequirePermissions('users:read')
  async list(@Query() query: QueryUsersDto) {
    return success(await this.query.list(query), 'Usuarios consultados correctamente');
  }

  @Post()
  @HttpCode(201)
  @RequirePermissions('users:create')
  async register(@Body() input: RegisterUserDto, @Req() request: AuthenticatedRequest) {
    if (!request.user) throw ApiException.unauthorized();
    const { message, user } = await this.registration.register(input, request.user.id);
    return success(user, message, 201);
  }

  @Get('assignable-roles')
  @RequirePermissions('users:create')
  async assignableRoles() {
    return success(await this.registration.listAssignableRoles());
  }
}
