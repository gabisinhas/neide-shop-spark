import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { apiRequest } from '../../shared/api/httpClient';

export class ProductRepositoryImpl implements IProductRepository {
  async getAll(): Promise<Product[]> {
    return apiRequest<Product[]>('/products');
  }

  async getById(id: string): Promise<Product | null> {
    try {
      return await apiRequest<Product>(`/products/${id}`);
    } catch (error) {
      if (error instanceof Error && /(nao|não) encontrado/i.test(error.message)) {
        return null;
      }
      throw error;
    }
  }

  async add(product: Product): Promise<void> {
    await apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async update(id: string, updated: Partial<Product>): Promise<void> {
    await apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
  }

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }
}
