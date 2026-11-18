import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RegisterBreedDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la raza es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name!: string;

  @IsNotEmpty({ message: 'La raza debe asociarse a una especie' })
  @IsUUID('all', { message: 'La raza debe asociarse a una especie' })
  speciesId!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;
}
