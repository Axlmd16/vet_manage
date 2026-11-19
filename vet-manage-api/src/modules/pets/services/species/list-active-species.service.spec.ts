import { describe, expect, it, vi } from 'vitest';
import { ListActiveSpeciesService } from './list-active-species.service.js';
import type { SpeciesRepository } from '../../repositories/species.repository.js';

describe('ListActiveSpeciesService', () => {
  it('returns the active species from the repository', async () => {
    const active = [{ id: 'a', name: 'Canino' }, { id: 'b', name: 'Felino' }];
    const findActive = vi.fn().mockResolvedValue(active);
    const service = new ListActiveSpeciesService({ findActive } as unknown as SpeciesRepository);

    await expect(service.execute()).resolves.toEqual(active);
    expect(findActive).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when there are no active species', async () => {
    const service = new ListActiveSpeciesService({ findActive: vi.fn().mockResolvedValue([]) } as unknown as SpeciesRepository);

    await expect(service.execute()).resolves.toEqual([]);
  });
});
