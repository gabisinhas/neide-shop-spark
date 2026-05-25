import { Pool } from 'pg';
import { CreateProductUseCase } from '../application/usecases/CreateProductUseCase';
import { DeleteProductUseCase } from '../application/usecases/DeleteProductUseCase';
import { GetProductByIdUseCase } from '../application/usecases/GetProductByIdUseCase';
import { ListProductsUseCase } from '../application/usecases/ListProductsUseCase';
import { UpdateProductUseCase } from '../application/usecases/UpdateProductUseCase';
import { PrismaProductRepository } from './persistence/PrismaProductRepository';

export class CatalogModule {
  readonly listProducts: ListProductsUseCase;
  readonly getProductById: GetProductByIdUseCase;
  readonly createProduct: CreateProductUseCase;
  readonly updateProduct: UpdateProductUseCase;
  readonly deleteProduct: DeleteProductUseCase;

  constructor(pool: Pool) {
    const productRepository = new PrismaProductRepository();

    this.listProducts = new ListProductsUseCase(productRepository);
    this.getProductById = new GetProductByIdUseCase(productRepository);
    this.createProduct = new CreateProductUseCase(productRepository);
    this.updateProduct = new UpdateProductUseCase(productRepository);
    this.deleteProduct = new DeleteProductUseCase(productRepository);
  }
}