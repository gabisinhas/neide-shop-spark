import { Product } from '../entities/Product';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  add(product: Product): Promise<void>;
  update(id: string, product: Partial<Product>): Promise<void>;
  remove(id: string): Promise<void>;
}
