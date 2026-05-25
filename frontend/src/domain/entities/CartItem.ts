import { Product } from './Product';

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}
