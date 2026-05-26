import { Pool } from 'pg';
import { CreateCategoryUseCase } from '../application/usecases/CreateCategoryUseCase';
import { CreateProductUseCase } from '../application/usecases/CreateProductUseCase';
import { DeleteCategoryUseCase } from '../application/usecases/DeleteCategoryUseCase';
import { DeleteProductUseCase } from '../application/usecases/DeleteProductUseCase';
import { GetCategoryByIdUseCase } from '../application/usecases/GetCategoryByIdUseCase';
import { GetProductByIdUseCase } from '../application/usecases/GetProductByIdUseCase';
import { ListCategoriesUseCase } from '../application/usecases/ListCategoriesUseCase';
import { ListProductsUseCase } from '../application/usecases/ListProductsUseCase';
import { UpdateCategoryUseCase } from '../application/usecases/UpdateCategoryUseCase';
import { UpdateProductUseCase } from '../application/usecases/UpdateProductUseCase';
import { PostgresCategoryRepository } from './persistence/PostgresCategoryRepository';
import { PrismaProductRepository } from './persistence/PrismaProductRepository';

export class CatalogModule {
  readonly listCategories: ListCategoriesUseCase;
  readonly getCategoryById: GetCategoryByIdUseCase;
  readonly createCategory: CreateCategoryUseCase;
  readonly updateCategory: UpdateCategoryUseCase;
  readonly deleteCategory: DeleteCategoryUseCase;
  readonly listProducts: ListProductsUseCase;
  readonly getProductById: GetProductByIdUseCase;
  readonly createProduct: CreateProductUseCase;
  readonly updateProduct: UpdateProductUseCase;
  readonly deleteProduct: DeleteProductUseCase;

  constructor(pool: Pool) {
    const categoryRepository = new PostgresCategoryRepository(pool);
    const productRepository = new PrismaProductRepository();

    this.listCategories = new ListCategoriesUseCase(categoryRepository);
    this.getCategoryById = new GetCategoryByIdUseCase(categoryRepository);
    this.createCategory = new CreateCategoryUseCase(categoryRepository);
    this.updateCategory = new UpdateCategoryUseCase(categoryRepository);
    this.deleteCategory = new DeleteCategoryUseCase(categoryRepository);
    this.listProducts = new ListProductsUseCase(productRepository);
    this.getProductById = new GetProductByIdUseCase(productRepository);
    this.createProduct = new CreateProductUseCase(productRepository, categoryRepository);
    this.updateProduct = new UpdateProductUseCase(productRepository, categoryRepository);
    this.deleteProduct = new DeleteProductUseCase(productRepository);
  }
}