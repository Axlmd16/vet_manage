import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { success } from '../../../common/errors/api-response.js';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../identity/guards/permissions.guard.js';
import { RequirePermissions } from '../../identity/decorators/require-permissions.decorator.js';
import { RegisterPetDto } from '../dtos/pets/register-pet.dto.js';
import { PET_MESSAGES, RegisterPetService } from '../services/pets/register-pet.service.js';

@Controller('pets')
export class PetsController {
  constructor(private readonly registerPetService: RegisterPetService) {}

  // Recepcionista, Gerente y Veterinario tienen pets:create.
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('pets:create')
  async registerPet(@Body() dto: RegisterPetDto) {
    return success(await this.registerPetService.execute(dto), PET_MESSAGES.registered, 201);
  }
}
