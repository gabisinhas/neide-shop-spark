import { AddToCartUseCase } from '../../application/usecases/cart/AddToCartUseCase';
import { ClearCartUseCase } from '../../application/usecases/cart/ClearCartUseCase';
import { RemoveFromCartUseCase } from '../../application/usecases/cart/RemoveFromCartUseCase';
import { UpdateCartQuantityUseCase } from '../../application/usecases/cart/UpdateCartQuantityUseCase';
import { CreateProductUseCase } from '../../application/usecases/product/CreateProductUseCase';
import { DeleteProductUseCase } from '../../application/usecases/product/DeleteProductUseCase';
import { GetAllProductsUseCase } from '../../application/usecases/product/GetAllProductsUseCase';
import { UpdateProductUseCase } from '../../application/usecases/product/UpdateProductUseCase';
import { CartRepositoryImpl } from '../repositories/CartRepositoryImpl';
import { ProductRepositoryImpl } from '../repositories/ProductRepositoryImpl';

const productRepository = new ProductRepositoryImpl();
const cartRepository = new CartRepositoryImpl();

export const appDependencies = {
  product: {
    getAllProducts: new GetAllProductsUseCase(productRepository),
    createProduct: new CreateProductUseCase(productRepository),
    updateProduct: new UpdateProductUseCase(productRepository),
    deleteProduct: new DeleteProductUseCase(productRepository),
  },
  cart: {
    repository: cartRepository,
    addToCart: new AddToCartUseCase(cartRepository),
    removeFromCart: new RemoveFromCartUseCase(cartRepository),
    updateCartQuantity: new UpdateCartQuantityUseCase(cartRepository),
    clearCart: new ClearCartUseCase(cartRepository),
  },
};

export type ProductDependencies = typeof appDependencies.product;
export type CartDependencies = typeof appDependencies.cart;