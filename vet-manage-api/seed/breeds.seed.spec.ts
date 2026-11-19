import { describe, expect, it, vi } from 'vitest';
import { BREEDS_DEMO, seedBreeds } from './breeds.seed.js';
import { SPECIES_DEMO } from './species.seed.js';

function createPrismaMock(knownSpecies: string[]) {
  const tx = {
    species: {
      findUnique: vi.fn(async ({ where }: { where: { name: string } }) =>
        knownSpecies.includes(where.name) ? { id: `id-${where.name}` } : null),
    },
    breed: { upsert: vi.fn(async () => ({ id: 'breed' })) },
  };
  return { tx, prisma: { $transaction: vi.fn((cb: (t: typeof tx) => unknown) => cb(tx)) } };
}

describe('Breeds demo seed', () => {
  it('only references demo species and has unique names per species', () => {
    const speciesNames = SPECIES_DEMO.species.map(({ name }) => name);
    const keys = BREEDS_DEMO.breeds.map(({ species, name }) => `${species}:${name}`);

    expect(BREEDS_DEMO.breeds.every(({ species }) => speciesNames.includes(species))).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('upserts every breed in one transaction', async () => {
    const { prisma, tx } = createPrismaMock(SPECIES_DEMO.species.map(({ name }) => name));

    const result = await seedBreeds(prisma as never);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.breed.upsert).toHaveBeenCalledTimes(BREEDS_DEMO.breeds.length);
    expect(result).toEqual({ breeds: BREEDS_DEMO.breeds.length });
  });

  it('skips breeds whose species does not exist', async () => {
    const { prisma, tx } = createPrismaMock(['Canino']);

    const result = await seedBreeds(prisma as never);

    expect(tx.breed.upsert).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ breeds: 3 });
  });
});
