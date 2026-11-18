import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { success } from '../../../common/errors/api-response.js';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../identity/guards/permissions.guard.js';
import { RequirePermissions } from '../../identity/decorators/require-permissions.decorator.js';
import { RegisterSpeciesDto } from '../dtos/species/register-species.dto.js';
import { RegisterSpeciesService } from '../services/species/register-species.service.js';
import { SpeciesRepository } from '../repositories/species.repository.js';

@Controller('pets')
export class SpeciesController {
  constructor(
    private readonly registerSpeciesService: RegisterSpeciesService,
    private readonly speciesRepository: SpeciesRepository,
  ) {}

  @Post('species')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('species:create')
  async registerSpecies(@Body() dto: RegisterSpeciesDto) {
    const created = await this.registerSpeciesService.execute(dto);
    return success(created, 'Especie registrada exitosamente', 201);
  }

  @Get('species')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('species:read')
  async listSpecies() {
    const items = await this.speciesRepository.list();
    return success(items);
  }
}
