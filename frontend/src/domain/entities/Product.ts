export interface ProductVariant {
  id: string;
  productId: string;
  size: string; // E.g., 'P', 'M', 'G', 'GG', 'U'
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  image: string;
  category: string;
  description?: string;
  sku?: string;
  stockQuantity?: number;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  imageStorageProvider?: 's3' | 'local';
  imageStorageKey?: string;
  imageContentType?: string;
  imageUploadedAt?: string;
  tag?: "lancamento" | "destaque" | "oferta";
  variants?: ProductVariant[];
  installments?: {
    count: number;
    value: number;
  };
}
