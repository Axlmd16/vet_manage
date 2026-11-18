import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RegisterSpeciesService } from './register-species.service.js';
import { SpeciesRepository } from '../../repositories/species.repository.js';
import { ApiException } from '../../../../common/errors/api-exception.js';

describe('RegisterSpeciesService', () => {
  let service: RegisterSpeciesService;
  let repository: SpeciesRepository;

  beforeEach(() => {
    repository = {
      findByName: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      list: vi.fn(),
    } as unknown as SpeciesRepository;

    service = new RegisterSpeciesService(repository);
  });

  it('debe registrar exitosamente una especie con nombre y descripción', async () => {
    const mockCreated = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Canino',
      description: 'Perros domésticos y salvajes',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(repository.findByName).mockResolvedValue(null);
    vi.mocked(repository.create).mockResolvedValue(mockCreated);

    const result = await service.execute({
      name: 'Canino',
      description: 'Perros domésticos y salvajes',
    });

    expect(repository.findByName).toHaveBeenCalledWith('Canino');
    expect(repository.create).toHaveBeenCalledWith({
      name: 'Canino',
      description: 'Perros domésticos y salvajes',
    });
    expect(result).toEqual(mockCreated);
    expect(result.isActive).toBe(true);
  });

  it('debe registrar exitosamente una especie sin descripción (opcional)', async () => {
    const mockCreated = {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      name: 'Felino',
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(repository.findByName).mockResolvedValue(null);
    vi.mocked(repository.create).mockResolvedValue(mockCreated);

    const result = await service.execute({
      name: 'Felino',
    });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Felino',
      description: undefined,
    });
    expect(result.name).toBe('Felino');
    expect(result.description).toBeNull();
  });

  it('debe lanzar ApiException.badRequest cuando el nombre está vacío', async () => {
    await expect(
      service.execute({
        name: '   ',
      }),
    ).rejects.toThrow(ApiException);

    await expect(
      service.execute({
        name: '   ',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'El nombre de la especie es obligatorio',
    });
  });

  it('debe lanzar ApiException.conflict cuando ya existe una especie con ese nombre', async () => {
    const existing = {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      name: 'Canino',
      description: 'Existente',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(repository.findByName).mockResolvedValue(existing);

    await expect(
      service.execute({
        name: 'Canino',
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Ya existe una especie registrada con el nombre "Canino"',
    });
  });
});
