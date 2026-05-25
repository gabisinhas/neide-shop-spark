import { Product } from '@/domain/entities/Product';

export function getEffectiveProductPrice(product: Product) {
  return product.salePrice ?? product.price;
}

export function getDisplayOriginalPrice(product: Product) {
  if (product.salePrice != null && product.salePrice < product.price) {
    return product.price;
  }

  return product.originalPrice;
}
