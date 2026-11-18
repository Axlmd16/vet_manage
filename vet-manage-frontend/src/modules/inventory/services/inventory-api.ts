import { getJson, postJson } from '../../../infrastructure/api/http-client';
import type { CatalogItem, Product, ProductDraft } from '../types';

export const inventoryApi = {
  listProducts(search = '') {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return getJson<Product[]>(`/inventory/products${query}`);
  },
  listCategories() {
    return getJson<CatalogItem[]>('/inventory/categories');
  },
  listBrands() {
    return getJson<CatalogItem[]>('/inventory/brands');
  },
  createProduct(draft: ProductDraft) {
    return postJson<Product, ProductDraft>('/inventory/products', {
      ...draft,
      unitPrice: draft.unitPrice,
    });
  },
  createCategory(name: string) {
    return postJson<CatalogItem, { name: string }>('/inventory/categories', { name });
  },
  createBrand(name: string) {
    return postJson<CatalogItem, { name: string }>('/inventory/brands', { name });
  },
};
