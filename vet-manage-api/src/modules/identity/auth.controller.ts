import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { ApiException } from '../../common/errors/api-exception.js';
import { success } from '../../common/errors/api-response.js';
import { Authenticated } from './decorators/require-permissions.decorator.js';
import { LoginDto } from './dtos/login.dto.js';
import { AccessService } from './services/access.service.js';
import { AuthService } from './services/auth.service.js';
import type { AuthenticatedRequest } from './types/authenticated-request.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly access: AccessService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() input: LoginDto) {
    return success(await this.auth.login(input), 'Sesión iniciada correctamente');
  }

  @Get('me')
  @Authenticated()
  async me(@Req() request: AuthenticatedRequest) {
    const profile = request.user && (await this.access.getSessionProfile(request.user.id));
    if (!profile) throw ApiException.unauthorized();
    return success(profile);
  }
}
