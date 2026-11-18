import { IsOptional, IsString } from 'class-validator';

// Los campos vacíos los valida el servicio para responder con un único mensaje.
export class LoginDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
