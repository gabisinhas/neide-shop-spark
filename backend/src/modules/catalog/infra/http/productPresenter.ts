import { Product } from '../../domain/entities/Product';
import { toAbsoluteAssetUrl } from '../../../../shared/infra/http/imageUrl';

export function presentProduct(product: Product, host: string, protocol: string): Product {
  const imageUrl = product.image ? toAbsoluteAssetUrl(host, protocol, product.image) : product.image;

  return {
    ...product,
    image: imageUrl,
  };
}
