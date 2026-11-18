import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { success } from '../../common/errors/api-response.js';
import { CreateCatalogItemDto } from './dtos/create-catalog-item.dto.js';
import { CreateProductDto } from './dtos/create-product.dto.js';
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

  @Get('brands')
  async listBrands() {
    return success(await this.inventoryService.listBrands());
  }

  @Post('brands')
  async createBrand(@Body() input: CreateCatalogItemDto) {
    return success(await this.inventoryService.createBrand(input), 'Marca creada correctamente', 201);
  }

  @Get('products')
  async listProducts(@Query('search') search?: string) {
    return success(await this.inventoryService.listProducts(search));
  }

  @Post('products')
  async createProduct(@Body() input: CreateProductDto) {
    return success(await this.inventoryService.createProduct(input), 'Producto registrado correctamente', 201);
  }
}
