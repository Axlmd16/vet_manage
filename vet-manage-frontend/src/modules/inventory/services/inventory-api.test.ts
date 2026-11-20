import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getJson, patchJson } from '../../../infrastructure/api/http-client';
import type { InventoryCategory } from '../types';
import { inventoryApi } from './inventory-api';

vi.mock('../../../infrastructure/api/http-client', () => ({
  getJson: vi.fn(),
  patchJson: vi.fn(),
  postJson: vi.fn(),
}));

const categories: InventoryCategory[] = [
  { id: 'category-1', name: 'Accesorios', vatRate: '12.5' },
  { id: 'category-2', name: 'Alimentos', vatRate: null },
];

describe('inventoryApi VAT contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads category VAT values, including an unconfigured null', async () => {
    vi.mocked(getJson).mockResolvedValue(categories as never);

    await expect(inventoryApi.listCategories()).resolves.toEqual(categories);
    expect(getJson).toHaveBeenCalledWith('/inventory/categories');
  });

  it('patches the category VAT with its UUID and a decimal string', async () => {
    vi.mocked(patchJson).mockResolvedValue(categories[0] as never);

    await inventoryApi.updateCategoryVat('category-1', '12.50');

    expect(patchJson).toHaveBeenCalledWith('/inventory/categories/category-1/vat', { vatRate: '12.50' });
  });
});
