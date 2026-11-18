import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CatalogReferenceDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
