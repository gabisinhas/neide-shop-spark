import { CartItem } from '../../domain/entities/CartItem';
import { ICartRepository } from '../../domain/repositories/ICartRepository';

const CART_STORAGE_KEY = '@NeideShop:cart';

export class CartRepositoryImpl implements ICartRepository {
  async getCart(): Promise<CartItem[]> {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading cart from localStorage', error);
      return [];
    }
  }

  async saveCart(items: CartItem[]): Promise<void> {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage', error);
    }
  }
}
