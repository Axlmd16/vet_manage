import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

const trimString = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateSupplierDto {
  @Transform(trimString)
  @IsString({ message: 'La razón social debe ser texto' })
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  businessName!: string;

  @Transform(trimString)
  @IsString({ message: 'El RUC debe ser texto' })
  @IsNotEmpty({ message: 'El RUC es obligatorio' })
  ruc!: string;
}
