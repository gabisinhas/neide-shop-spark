import { CartItem } from '../entities/CartItem';

export interface ICartRepository {
  getCart(): Promise<CartItem[]>;
  saveCart(items: CartItem[]): Promise<void>;
}
