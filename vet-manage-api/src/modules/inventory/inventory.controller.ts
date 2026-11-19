import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { success } from '../../common/errors/api-response.js';
import { CreateCatalogItemDto } from './dtos/create-catalog-item.dto.js';
import { CreateProductDto } from './dtos/create-product.dto.js';
import { RegisterBatchEntryDto } from './dtos/register-batch-entry.dto.js';
import { RequirePermissions } from '../identity/decorators/require-permissions.decorator.js';
import { InventoryService } from './services/inventory.service.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('categories')
  async listCategories() {
    return success(await this.inventoryService.listCategories());
  }

  @Post('categories')
  async createCategory(@Body() input: CreateCatalogItemDto) {
    return success(await this.inventoryService.createCategory(input), 'Categoría creada correctamente', 201);
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() input: CreateCatalogItemDto) {
    return success(await this.inventoryService.updateCategory(id, input), 'Categoría actualizada correctamente');
  }

  @Get('brands')
  async listBrands() {
    return success(await this.inventoryService.listBrands());
  }

  @Post('brands')
  async createBrand(@Body() input: CreateCatalogItemDto) {
    return success(await this.inventoryService.createBrand(input), 'Marca creada correctamente', 201);
  }

  @Patch('brands/:id')
  async updateBrand(@Param('id') id: string, @Body() input: CreateCatalogItemDto) {
    return success(await this.inventoryService.updateBrand(id, input), 'Marca actualizada correctamente');
  }

  @Get('products')
  async listProducts(@Query('search') search?: string) {
    return success(await this.inventoryService.listProducts(search));
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return success(await this.inventoryService.getProduct(id));
  }

  @Post('products')
  async createProduct(@Body() input: CreateProductDto) {
    return success(await this.inventoryService.createProduct(input), 'Producto registrado correctamente', 201);
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() input: CreateProductDto) {
    return success(await this.inventoryService.updateProduct(id, input), 'Producto actualizado correctamente');
  }

  // HU-02: solo quien tiene inventory:register-entry (Bodeguero) registra entradas de lote.
  @Post('batches')
  @RequirePermissions('inventory:register-entry')
  async registerBatchEntry(@Body() input: RegisterBatchEntryDto) {
    return success(await this.inventoryService.registerBatchEntry(input), 'Entrada de lote registrada correctamente', 201);
  }
}
