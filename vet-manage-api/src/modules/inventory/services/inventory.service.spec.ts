import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../generated/prisma/client.js';
import { ApiException } from '../../../common/errors/api-exception.js';
import { InventoryService } from './inventory.service.js';

function createPrismaMock() {
  const tx = {
    category: {
      upsert: vi.fn().mockResolvedValue({ id: 'category-1' }),
      findFirst: vi.fn().mockResolvedValue({ id: 'category-1', name: 'Alimentos' }),
      update: vi.fn().mockResolvedValue({ id: 'category-1', name: 'Nutrición', description: 'Nueva' }),
    },
    marca: {
      upsert: vi.fn().mockResolvedValue({ id: 'brand-1' }),
      findFirst: vi.fn().mockResolvedValue({ id: 'brand-1', name: 'Dog Chow' }),
      update: vi.fn().mockResolvedValue({ id: 'brand-1', name: 'Royal Canin', description: null }),
    },
    product: {
      create: vi.fn().mockResolvedValue({
        id: 'product-1', code: 'PR-001', name: 'Producto', description: null,
        unitPrice: new Prisma.Decimal('25.50'), category: { id: 'category-1', name: 'Alimentos' },
        brand: { id: 'brand-1', name: 'Dog Chow' }, createdAt: new Date('2026-01-01'),
      }),
      update: vi.fn().mockResolvedValue({
        id: 'product-1', code: 'PR-001', name: 'Producto actualizado', description: null,
        unitPrice: new Prisma.Decimal('30.00'), category: { id: 'category-1', name: 'Alimentos' },
        brand: { id: 'brand-1', name: 'Dog Chow' }, createdAt: new Date('2026-01-01'),
      }),
    },
  };
  return {
    tx,
    prisma: {
      $transaction: vi.fn((callback) => callback(tx)),
      category: {
        findUnique: vi.fn().mockResolvedValue({ id: 'category-1', name: 'Alimentos', isActive: true }),
        update: vi.fn().mockResolvedValue({ id: 'category-1', name: 'Nutrición', description: 'Nueva' }),
      },
      marca: {
        findUnique: vi.fn().mockResolvedValue({ id: 'brand-1', name: 'Dog Chow', isActive: true }),
        update: vi.fn().mockResolvedValue({ id: 'brand-1', name: 'Royal Canin', description: null }),
      },
      product: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'product-1', code: 'PR-001', name: 'Producto', description: null,
          unitPrice: new Prisma.Decimal('25.50'), category: { id: 'category-1', name: 'Alimentos' },
          brand: { id: 'brand-1', name: 'Dog Chow' }, createdAt: new Date('2026-01-01'),
        }),
      },
    },
  };
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
    expect(tx.marca.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'Dog Chow' } }));
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

  it('updates a category and trims its editable fields', async () => {
    const { prisma } = createPrismaMock();
    const service = new InventoryService(prisma as never);

    const result = await service.updateCategory('category-1', { name: ' Nutrición ', description: ' Nueva ' });

    expect(result).toMatchObject({ name: 'Nutrición', description: 'Nueva' });
    expect(prisma.category.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'category-1' },
      data: { name: 'Nutrición', description: 'Nueva' },
    }));
  });

  it('translates a duplicate brand name into a conflict', async () => {
    const { prisma } = createPrismaMock();
    prisma.marca.update.mockRejectedValue({ code: 'P2002', meta: { target: ['name'] } });
    const service = new InventoryService(prisma as never);

    await expect(service.updateBrand('brand-1', { name: 'Royal Canin' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'La marca ya está registrada',
    });
  });

  it('translates a duplicate category name into a conflict', async () => {
    const { prisma } = createPrismaMock();
    prisma.category.update.mockRejectedValue({ code: 'P2002', meta: { target: ['name'] } });
    const service = new InventoryService(prisma as never);

    await expect(service.updateCategory('category-1', { name: 'Farmacia' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'La categoría ya está registrada',
    });
  });

  it('rejects an empty category name before touching persistence', async () => {
    const { prisma } = createPrismaMock();
    const service = new InventoryService(prisma as never);

    await expect(service.updateCategory('category-1', { name: ' ' })).rejects.toMatchObject({ statusCode: 400 });
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('loads a product with its category and brand', async () => {
    const { prisma } = createPrismaMock();
    const service = new InventoryService(prisma as never);

    const result = await service.getProduct('product-1');

    expect(result).toMatchObject({ id: 'product-1', category: { name: 'Alimentos' }, brand: { name: 'Dog Chow' } });
    expect(prisma.product.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'product-1', isActive: true } }));
  });

  it('returns not found for an invalid product id format', async () => {
    const { prisma } = createPrismaMock();
    prisma.product.findFirst.mockRejectedValue({ code: 'P2023' });
    const service = new InventoryService(prisma as never);

    await expect(service.getProduct('not-a-uuid')).rejects.toMatchObject({ statusCode: 404, message: 'Producto no encontrado' });
    expect(prisma.product.findFirst).toHaveBeenCalled();
  });

  it('updates a product and serializes its decimal price', async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new InventoryService(prisma as never);

    const result = await service.updateProduct('product-1', {
      code: 'PR-001', name: 'Producto actualizado', description: '', unitPrice: 30,
      category: { id: 'category-1' }, brand: { id: 'brand-1' },
    });

    expect(result.unitPrice).toBe('30');
    expect(tx.product.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'product-1' },
      data: expect.objectContaining({ code: 'PR-001', name: 'Producto actualizado', description: null }),
    }));
  });

  it('rejects a non-positive price when updating a product', async () => {
    const { prisma } = createPrismaMock();
    const service = new InventoryService(prisma as never);

    await expect(service.updateProduct('product-1', {
      code: 'PR-001', name: 'Producto', unitPrice: 0,
      category: { id: 'category-1' }, brand: { id: 'brand-1' },
    })).rejects.toMatchObject({ statusCode: 400, message: 'Revisa los campos del producto' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns not found when updating a missing product', async () => {
    const { prisma } = createPrismaMock();
    prisma.$transaction.mockRejectedValue({ code: 'P2025' });
    const service = new InventoryService(prisma as never);

    await expect(service.updateProduct('missing', {
      code: 'PR-001', name: 'Producto', unitPrice: 20,
      category: { id: 'category-1' }, brand: { id: 'brand-1' },
    })).rejects.toMatchObject({ statusCode: 404, message: 'Producto no encontrado' });
  });
});
