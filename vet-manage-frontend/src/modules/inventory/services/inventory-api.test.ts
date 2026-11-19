import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getJson } from '../../../infrastructure/api/http-client';
import { inventoryApi } from './inventory-api';

vi.mock('../../../infrastructure/api/http-client', () => ({
  getJson: vi.fn(),
  postJson: vi.fn(),
  patchJson: vi.fn(),
}));

describe('inventoryApi.listProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('construye una consulta con texto, categoría y marca sin perder caracteres', () => {
    inventoryApi.listProducts(' Dog & Chow ', {
      categoryId: 'category-1', brandId: 'brand-1', batchCode: ' L-2026-001 ',
    });

    expect(getJson).toHaveBeenCalledWith(
      '/inventory/products?search=Dog+%26+Chow&categoryId=category-1&brandId=brand-1&batchCode=L-2026-001',
    );
  });

  it('consulta el catálogo completo cuando se limpian los filtros', () => {
    inventoryApi.listProducts(' ', { categoryId: '', brandId: '' });

    expect(getJson).toHaveBeenCalledWith('/inventory/products');
  });
});
