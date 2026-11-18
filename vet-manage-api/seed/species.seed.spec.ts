import { describe, expect, it, vi } from 'vitest';
import { SPECIES_DEMO, seedSpecies } from './species.seed.js';

function createPrismaMock() {
  const tx = {
    species: {
      upsert: vi.fn(async ({ create }: { create: { name: string } }) => ({ id: `species-${create.name}` })),
    },
  };
  return { tx, prisma: { $transaction: vi.fn((callback: (transaction: typeof tx) => unknown) => callback(tx)) } };
}

describe('Species demo seed', () => {
  it('declares demo species with unique names and descriptions', () => {
    const names = SPECIES_DEMO.species.map(({ name }) => name);

    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
    expect(SPECIES_DEMO.species.every(({ description }) => description.length > 0)).toBe(true);
  });

  it('upserts every species in one transaction', async () => {
    const { prisma, tx } = createPrismaMock();

    const result = await seedSpecies(prisma as never);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.species.upsert).toHaveBeenCalledTimes(SPECIES_DEMO.species.length);
    expect(tx.species.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: SPECIES_DEMO.species[0].name },
      create: expect.objectContaining({ name: SPECIES_DEMO.species[0].name, isActive: true }),
    }));
    expect(result).toEqual({ species: SPECIES_DEMO.species.length });
  });
});
