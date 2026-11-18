import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, beforeAll, afterAll, it, expect, vi } from 'vitest';
import configuration from '../../src/config/configuration.js';
import { GlobalExceptionFilter } from '../../src/common/errors/global-exception.filter.js';
import { PetsModule } from '../../src/modules/pets/pets.module.js';
import { SpeciesRepository } from '../../src/modules/pets/repositories/species.repository.js';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service.js';
import { JwtAuthGuard } from '../../src/modules/identity/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../src/modules/identity/guards/permissions.guard.js';

describe('SpeciesController (e2e)', () => {
  let app: INestApplication;
  let mockSpeciesDb: any[] = [];

  const mockSpeciesRepo = {
    findByName: vi.fn(async (name: string) => {
      return mockSpeciesDb.find((s) => s.name.toLowerCase() === name.trim().toLowerCase()) || null;
    }),
    findById: vi.fn(async (id: string) => {
      return mockSpeciesDb.find((s) => s.id === id) || null;
    }),
    create: vi.fn(async (data: { name: string; description?: string | null }) => {
      const created = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: data.name,
        description: data.description || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSpeciesDb.push(created);
      return created;
    }),
    list: vi.fn(async () => mockSpeciesDb),
  };

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/vet_manage';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret-for-testing-only-at-least-32-chars-long';
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        PetsModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(SpeciesRepository)
      .useValue(mockSpeciesRepo)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /pets/species - registra una nueva especie con éxito (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/pets/species')
      .send({
        name: 'Canino',
        description: 'Perros domésticos',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Canino');
    expect(res.body.data.description).toBe('Perros domésticos');
    expect(res.body.data.isActive).toBe(true);
  });

  it('POST /pets/species - registra una nueva especie sin descripción (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/pets/species')
      .send({
        name: 'Felino',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Felino');
    expect(res.body.data.description).toBeNull();
  });

  it('POST /pets/species - rechaza solicitud con nombre vacío (400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/pets/species')
      .send({
        name: '',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('POST /pets/species - rechaza duplicados con error de conflicto (409)', async () => {
    const res = await request(app.getHttpServer())
      .post('/pets/species')
      .send({
        name: 'Canino',
      })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Ya existe una especie registrada con el nombre "Canino"');
  });

  it('GET /pets/species - lista las especies registradas', async () => {
    const res = await request(app.getHttpServer())
      .get('/pets/species')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});
