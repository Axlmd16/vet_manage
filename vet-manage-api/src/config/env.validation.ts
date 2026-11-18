import { Type, plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { PASSWORD_PATTERN, PASSWORD_POLICY_MESSAGE } from '../common/security/password-policy.js';

class EnvironmentVariables {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT = 3080;

  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsUrl({ protocols: ['redis'], require_tld: false })
  REDIS_URL = 'redis://redis:56379';

  @IsOptional()
  @IsUrl({ protocols: ['amqp', 'amqps'], require_tld: false })
  RABBITMQ_URL = 'amqp://vetmanage:vetmanage_dev_password@rabbitmq:55672';

  @IsString()
  @MinLength(32)
  JWT_SECRET!: string;

  @IsOptional()
  @Matches(/^\d+[smhd]$/, { message: 'JWT_EXPIRES_IN debe tener formato como 15m, 1h o 7d' })
  JWT_EXPIRES_IN = '15m';

  @IsOptional()
  @IsIn(['create-only', 'strict'])
  RBAC_SYNC_MODE = 'create-only';

  @IsEmail()
  @MaxLength(255)
  ADMIN_EMAIL!: string;

  @Matches(PASSWORD_PATTERN, { message: PASSWORD_POLICY_MESSAGE })
  ADMIN_PASSWORD!: string;

  @Matches(/^\d{10}$/, { message: 'ADMIN_IDENTIFICATION debe tener 10 dígitos' })
  ADMIN_IDENTIFICATION!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ADMIN_FIRST_NAME!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ADMIN_LAST_NAME!: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {
    skipMissingProperties: false,
    validationError: { target: false, value: false },
  });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.toString()}`);
  }

  return validated;
}
