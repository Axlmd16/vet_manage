import { IsOptional } from 'class-validator';

// Los tipos se validan en RegisterPetService para responder con los mensajes de la HU-07.
// @IsOptional solo marca las propiedades como permitidas por el ValidationPipe (whitelist).
export class RegisterPetDto {
  @IsOptional() name?: unknown;
  @IsOptional() speciesId?: unknown;
  @IsOptional() breedId?: unknown;
  @IsOptional() sex?: unknown;
  @IsOptional() birthDate?: unknown;
  @IsOptional() weightKg?: unknown;
  @IsOptional() heightCm?: unknown;
  @IsOptional() reproductiveStatus?: unknown;
  @IsOptional() color?: unknown;
  @IsOptional() clientId?: unknown;
  // Se acepta para no rechazar la petición, pero se ignora: el código lo genera la base de datos.
  @IsOptional() code?: unknown;
}
