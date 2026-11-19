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
        findMany: vi.fn().mockResolvedValue([]),
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
  describe('búsqueda de productos (HU-10)', () => {
    it('lista los productos activos con el formato del catálogo cuando no hay filtros', async () => {
      const { prisma } = createPrismaMock();
      const product = { id: 'product-1', unitPrice: new Prisma.Decimal('25.50') };
      prisma.product.findMany.mockResolvedValue([product]);
      const service = new InventoryService(prisma as never);

      await expect(service.listProducts()).resolves.toEqual([{ ...product, unitPrice: '25.5' }]);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: { category: true, brand: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('admite la búsqueda existente por código o nombre de producto', async () => {
      const { prisma } = createPrismaMock();
      const service = new InventoryService(prisma as never);

      await service.listProducts({ search: ' PR-001 ' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          isActive: true,
          OR: [
            { code: { contains: 'PR-001', mode: 'insensitive' } },
            { name: { contains: 'PR-001', mode: 'insensitive' } },
            { category: { name: { contains: 'PR-001', mode: 'insensitive' } } },
            { brand: { name: { contains: 'PR-001', mode: 'insensitive' } } },
            { batches: { some: { code: { equals: 'PR-001', mode: 'insensitive' } } } },
          ],
        },
      }));
    });

    it.each(['L-2026-001', 'l-2026-001'])('busca el código completo del lote %s', async (batchCode) => {
      const { prisma } = createPrismaMock();
      const service = new InventoryService(prisma as never);

      await service.listProducts({ batchCode: ' ' + batchCode + ' ' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          isActive: true,
          batches: { some: { code: { equals: batchCode, mode: 'insensitive' } } },
        },
      }));
    });

    it.each(['Kong', 'KONG', 'kong'])('busca la marca %s sin distinguir mayúsculas', async (search) => {
      const { prisma } = createPrismaMock();
      const service = new InventoryService(prisma as never);

      await service.listProducts({ search });

      expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { brand: { name: { contains: search, mode: 'insensitive' } } },
          ]),
        }),
      }));
    });

    it.each([
      ['15', { gte: new Prisma.Decimal('15'), lt: new Prisma.Decimal('16') }],
      ['15.30', new Prisma.Decimal('15.30')],
    ])('busca el precio %s desde el campo general y desde el filtro de precio', async (precio, filtro) => {
      const { prisma } = createPrismaMock();
      const service = new InventoryService(prisma as never);

      await service.listProducts({ search: precio });
      expect(prisma.product.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([{ unitPrice: filtro }]),
        }),
      }));

      await service.listProducts({ unitPrice: precio });
      expect(prisma.product.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
        where: { isActive: true, unitPrice: filtro },
      }));
    });

    it.each([
      [{ name: ' Alimento ' }, { name: { contains: 'Alimento', mode: 'insensitive' } }],
      [{ categoryId: 'category-1' }, { categoryId: 'category-1' }],
      [{ brandId: 'brand-1' }, { brandId: 'brand-1' }],
      [{ brandName: ' Chow ' }, { brand: { name: { contains: 'Chow', mode: 'insensitive' } } }],
      [{ unitPrice: '25.50' }, { unitPrice: new Prisma.Decimal('25.50') }],
    ])('filtra productos activos mediante %j', async (consulta, filtro) => {
      const { prisma } = createPrismaMock();
      const service = new InventoryService(prisma as never);

      await service.listProducts(consulta);

      expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { isActive: true, ...filtro },
      }));
    });

    it('combina los criterios y devuelve una lista vacía cuando no hay coincidencias', async () => {
      const { prisma } = createPrismaMock();
      const service = new InventoryService(prisma as never);

      await expect(service.listProducts({
        name: 'Alimento',
        categoryId: 'category-1',
        brandId: 'brand-1',
        brandName: 'Chow',
        batchCode: 'L-2026-001',
        unitPrice: '25.50',
      })).resolves.toEqual([]);

      expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          isActive: true,
          name: { contains: 'Alimento', mode: 'insensitive' },
          categoryId: 'category-1',
          brandId: 'brand-1',
          brand: { name: { contains: 'Chow', mode: 'insensitive' } },
          batches: { some: { code: { equals: 'L-2026-001', mode: 'insensitive' } } },
          unitPrice: new Prisma.Decimal('25.50'),
        },
      }));
    });

    it('busca los caracteres comodín del nombre como texto literal', async () => {
      const { prisma } = createPrismaMock();
      const service = new InventoryService(prisma as never);

      await service.listProducts({ name: 'A_50%\\B' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { isActive: true, name: { contains: 'A\\_50\\%\\\\B', mode: 'insensitive' } },
      }));
    });
  });

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

  describe('registerBatchEntry (HU-02)', () => {
    const PRODUCT_ID = '123e4567-e89b-12d3-a456-426614174000';
    const entry = { productId: PRODUCT_ID, code: 'L-2026-001', expirationDate: '2027-10-23', initialQuantity: 50 };

    function createBatchMock() {
      const tx = {
        product: {
          findFirst: vi.fn().mockResolvedValue({ id: PRODUCT_ID }),
          update: vi.fn().mockResolvedValue({ id: PRODUCT_ID, code: 'PR-001', name: 'Alimento para perro', stock: 50 }),
        },
        batch: {
          create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'batch-1', ...data })),
        },
      };
      return { tx, prisma: { $transaction: vi.fn((callback) => callback(tx)) } };
    }

    it('registers the batch and increments the product stock in one transaction', async () => {
      const { prisma, tx } = createBatchMock();
      const service = new InventoryService(prisma as never);

      const result = await service.registerBatchEntry(entry);

      expect(tx.batch.create).toHaveBeenCalledWith({
        data: { productId: PRODUCT_ID, code: 'L-2026-001', expirationDate: new Date(Date.UTC(2027, 9, 23)), initialQuantity: 50 },
      });
      expect(tx.product.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: PRODUCT_ID },
        data: { stock: { increment: 50 } },
      }));
      expect(result.batch).toMatchObject({ code: 'L-2026-001', expirationDate: '2027-10-23', initialQuantity: 50 });
      expect(result.product.stock).toBe(50);
    });

    it('rejects invalid data without opening a transaction', async () => {
      const { prisma } = createBatchMock();
      const service = new InventoryService(prisma as never);

      await expect(service.registerBatchEntry({ ...entry, initialQuantity: 0 }))
        .rejects.toMatchObject({ statusCode: 400, message: 'La cantidad inicial debe ser mayor que cero' });
      await expect(service.registerBatchEntry({}))
        .rejects.toMatchObject({ statusCode: 400, message: 'Revisa los datos de la entrada de lote' });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('does not create the batch nor touch stock when the product does not exist', async () => {
      const { prisma, tx } = createBatchMock();
      tx.product.findFirst.mockResolvedValue(null);
      const service = new InventoryService(prisma as never);

      await expect(service.registerBatchEntry(entry))
        .rejects.toMatchObject({ statusCode: 404, message: 'El producto seleccionado no existe' });
      expect(tx.batch.create).not.toHaveBeenCalled();
      expect(tx.product.update).not.toHaveBeenCalled();
    });
  });
});
