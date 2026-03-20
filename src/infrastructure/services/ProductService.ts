import { Product } from '../../domain/entities/Product';

export class ProductService {
  private products: Product[] = [];

  getAll(): Product[] {
    return this.products;
  }

  add(product: Product): void {
    this.products.push(product);
  }

  update(id: string, updated: Partial<Product>): void {
    this.products = this.products.map(p =>
      p.id === id ? { ...p, ...updated } : p
    );
  }

  remove(id: string): void {
    this.products = this.products.filter(p => p.id !== id);
  }
}