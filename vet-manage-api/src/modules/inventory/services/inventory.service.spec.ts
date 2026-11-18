import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../generated/prisma/client.js';
import { ApiException } from '../../../common/errors/api-exception.js';
import { InventoryService } from './inventory.service.js';

function createPrismaMock() {
  const tx = {
    category: { upsert: vi.fn().mockResolvedValue({ id: 'category-1' }) },
    brand: { upsert: vi.fn().mockResolvedValue({ id: 'brand-1' }) },
    product: {
      create: vi.fn().mockResolvedValue({
        id: 'product-1', code: 'PR-001', name: 'Producto', description: null,
        unitPrice: new Prisma.Decimal('25.50'), category: { id: 'category-1', name: 'Alimentos' },
        brand: { id: 'brand-1', name: 'Dog Chow' }, createdAt: new Date('2026-01-01'),
      }),
    },
  };
  return { tx, prisma: { $transaction: vi.fn((callback) => callback(tx)) } };
}

describe('InventoryService', () => {
  it('creates category and brand inline in the product transaction', async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new InventoryService(prisma as never);

    const result = await service.createProduct({
      code: 'PR-001', name: 'Producto', description: '', unitPrice: 25.5,
      category: { name: 'Alimentos' }, brand: { name: 'Dog Chow' },
    });

    expect(result.unitPrice).toBe('25.5');
    expect(tx.category.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'Alimentos' } }));
    expect(tx.brand.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'Dog Chow' } }));
  });

  it('translates a duplicate product code into a conflict', async () => {
    const duplicateError = {
      code: 'P2002',
      meta: { driverAdapterError: { cause: { constraint: { index: 'products_code_key' } } } },
    };
    const { prisma } = createPrismaMock();
    prisma.$transaction.mockRejectedValue(duplicateError);
    const service = new InventoryService(prisma as never);

    await expect(service.createProduct({
      code: 'PR-001', name: 'Producto', unitPrice: 25.5,
      category: { name: 'Alimentos' }, brand: { name: 'Dog Chow' },
    })).rejects.toMatchObject({
      statusCode: 409,
      message: 'El código del producto ya está registrado',
    } satisfies Partial<ApiException>);
  });
});
