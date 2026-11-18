import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { ApiException } from '../../../common/errors/api-exception.js';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { CreateCatalogItemDto } from '../dtos/create-catalog-item.dto.js';
import { CatalogReferenceDto } from '../dtos/catalog-reference.dto.js';
import { CreateProductDto } from '../dtos/create-product.dto.js';
import { validateProductInput } from './product-input.service.js';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  constructor(private readonly prisma: PrismaService) {}

  listCategories() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  createCategory(input: CreateCatalogItemDto) {
    return this.createCatalogItem('category', input);
  }

  listBrands() {
    return this.prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  createBrand(input: CreateCatalogItemDto) {
    return this.createCatalogItem('brand', input);
  }

  async listProducts(search?: string) {
    const normalizedSearch = search?.trim();
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(normalizedSearch ? {
          OR: [
            { code: { contains: normalizedSearch, mode: 'insensitive' } },
            { name: { contains: normalizedSearch, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: { category: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.serializeProduct(product));
  }

  async createProduct(input: CreateProductDto) {
    const validation = validateProductInput(input);
    if (!validation.valid) {
      throw ApiException.badRequest('Revisa los campos del producto', Object.values(validation.errors));
    }

    try {
      const product = await this.prisma.$transaction(async (tx) => {
        const categoryId = await this.resolveCatalogReference(tx, 'category', input.category);
        const brandId = await this.resolveCatalogReference(tx, 'brand', input.brand);

        return tx.product.create({
          data: {
            code: input.code.trim(),
            name: input.name.trim(),
            description: input.description?.trim() || null,
            unitPrice: new Prisma.Decimal(input.unitPrice),
            categoryId,
            brandId,
          },
          include: { category: true, brand: true },
        });
      });

      return this.serializeProduct(product);
    } catch (error) {
      if (this.isUniqueConstraintError(error, ['products_code_key', 'code'])) {
        throw ApiException.conflict('El código del producto ya está registrado');
      }

      if (this.isUniqueConstraintError(error, ['categories_name_key', 'name'])) {
        throw ApiException.conflict('La categoría ya está registrada');
      }

      if (this.isUniqueConstraintError(error, ['brands_name_key', 'name'])) {
        throw ApiException.conflict('La marca ya está registrada');
      }

      this.logger.error('No se pudo registrar el producto', error);
      throw error;
    }
  }

  private async createCatalogItem(type: 'category' | 'brand', input: CreateCatalogItemDto) {
    try {
      const data = { name: input.name.trim(), description: input.description?.trim() || null };
      return type === 'category'
        ? await this.prisma.category.create({ data })
        : await this.prisma.brand.create({ data });
    } catch (error) {
      if (this.isUniqueConstraintError(error, [`${type === 'category' ? 'categories' : 'brands'}_name_key`, 'name'])) {
        throw ApiException.conflict(`${type === 'category' ? 'La categoría' : 'La marca'} ya está registrada`);
      }

      throw error;
    }
  }

  private async resolveCatalogReference(
    tx: Prisma.TransactionClient,
    type: 'category' | 'brand',
    reference: CatalogReferenceDto,
  ) {
    if (reference.id) {
      const item = type === 'category'
        ? await tx.category.findFirst({ where: { id: reference.id, isActive: true } })
        : await tx.brand.findFirst({ where: { id: reference.id, isActive: true } });
      if (!item) throw ApiException.badRequest(`La ${type === 'category' ? 'categoría' : 'marca'} seleccionada no existe`);
      return item.id;
    }

    const name = reference.name?.trim();
    if (!name) throw ApiException.badRequest(`La ${type === 'category' ? 'categoría' : 'marca'} es obligatoria`);
    const item = type === 'category'
      ? await tx.category.upsert({ where: { name }, update: { isActive: true }, create: { name } })
      : await tx.brand.upsert({ where: { name }, update: { isActive: true }, create: { name } });
    return item.id;
  }

  private isUniqueConstraintError(error: unknown, targets: string[]) {
    if (!error || typeof error !== 'object') return false;
    const knownError = error as {
      code?: unknown;
      originalCode?: unknown;
      constraint?: unknown;
      meta?: { target?: unknown; driverAdapterError?: { cause?: { originalCode?: unknown; constraint?: unknown } } };
      cause?: unknown;
    };
    const cause = knownError.cause && typeof knownError.cause === 'object'
      ? knownError.cause as { originalCode?: unknown; constraint?: unknown }
      : undefined;
    const driverCause = knownError.meta?.driverAdapterError?.cause;
    const code = knownError.code ?? knownError.originalCode ?? cause?.originalCode ?? driverCause?.originalCode;
    if (code !== 'P2002' && code !== '23505') return false;
    const constraintTarget = knownError.meta?.target
      ?? knownError.constraint
      ?? cause?.constraint
      ?? driverCause?.constraint;
    const targetText = typeof constraintTarget === 'object' && constraintTarget !== null && 'index' in constraintTarget
      ? String(constraintTarget.index)
      : Array.isArray(constraintTarget) ? constraintTarget.join('_') : typeof constraintTarget === 'string' ? constraintTarget : '';
    return targets.some((target) => targetText === target || targetText.includes(target));
  }

  private serializeProduct(product: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    unitPrice: Prisma.Decimal;
    category: { id: string; name: string };
    brand: { id: string; name: string };
    createdAt: Date;
  }) {
    return {
      ...product,
      unitPrice: product.unitPrice.toString(),
    };
  }
}
