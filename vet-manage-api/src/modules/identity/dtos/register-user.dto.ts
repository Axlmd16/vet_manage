import { IsArray, IsOptional, IsString } from 'class-validator';

// Los campos vacíos y los formatos los valida el servicio para responder con los mensajes de la HU.
export class RegisterUserDto {
  @IsOptional()
  @IsString()
  identification?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}
