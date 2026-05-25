import { Product } from '../../domain/entities/Product';

export type ProductDTO = Product;

export type CreateProductDTO = Product;

export type UpdateProductDTO = Partial<Product>;