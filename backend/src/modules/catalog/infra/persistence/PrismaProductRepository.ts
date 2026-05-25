import { prisma } from '../../../../shared/infra/database/prisma';
import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

function detectImageStorageProvider(image: string | undefined): Product['imageStorageProvider'] {
  if (!image) return undefined;
  if (image.includes('amazonaws.com') || image.includes('cloudfront.net')) return 's3';
  if (image.includes('/assets/')) return 'local';
  return undefined;
}

function detectImageStorageKey(image: string | undefined) {
  if (!image) return undefined;
  const uploadsIndex = image.indexOf('/assets/uploads/');
  if (uploadsIndex >= 0) {
    return image.slice(uploadsIndex + '/assets/uploads/'.length);
  }

  const assetsIndex = image.indexOf('/assets/');
  if (assetsIndex >= 0) {
    return image.slice(assetsIndex + '/assets/'.length);
  }

  const amazonIndex = image.indexOf('.com/');
  if (amazonIndex >= 0) {
    return image.slice(amazonIndex + '.com/'.length);
  }

  return undefined;
}

function detectImageContentType(image: string | undefined) {
  if (!image) return undefined;
  const normalized = image.toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
  return undefined;
}

export class PrismaProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products.map(this.toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        variants: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.toDomain(product);
  }

  async create(product: Product): Promise<Product> {
    const created = await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        sku: product.sku ?? product.id,
        price: product.price,
        salePrice: product.salePrice ?? null,
        originalPrice: product.originalPrice ?? null,
        stockQuantity: product.stockQuantity ?? 0,
        weight: product.weight ?? 0,
        height: product.height ?? 0,
        width: product.width ?? 0,
        length: product.length ?? 0,
        image: product.image,
        imageStorageProvider: product.imageStorageProvider ?? detectImageStorageProvider(product.image) ?? null,
        imageStorageKey: product.imageStorageKey ?? detectImageStorageKey(product.image) ?? null,
        imageContentType: product.imageContentType ?? detectImageContentType(product.image) ?? null,
        imageUploadedAt: product.imageUploadedAt ? new Date(product.imageUploadedAt) : product.image ? new Date() : null,
        category: product.category,
        tag: product.tag ?? null,
        installments: product.installments ? (product.installments as any) : null,
        variants: {
          create:
            product.variants && product.variants.length > 0
              ? product.variants.map((variant) => ({
                  size: variant.size,
                  stock: variant.stock,
                }))
              : [
                  { size: 'P', stock: product.stockQuantity ?? 0 },
                  { size: 'M', stock: product.stockQuantity ?? 0 },
                  { size: 'G', stock: product.stockQuantity ?? 0 },
                ],
        },
      } as any,
      include: {
        variants: true,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    const existing = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return null;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        salePrice: product.salePrice !== undefined ? product.salePrice : undefined,
        originalPrice: product.originalPrice !== undefined ? product.originalPrice : undefined,
        stockQuantity: product.stockQuantity,
        weight: product.weight,
        height: product.height,
        width: product.width,
        length: product.length,
        image: product.image,
        imageStorageProvider:
          product.image !== undefined || product.imageStorageProvider !== undefined
            ? product.imageStorageProvider ?? detectImageStorageProvider(product.image) ?? null
            : undefined,
        imageStorageKey:
          product.image !== undefined || product.imageStorageKey !== undefined
            ? product.imageStorageKey ?? detectImageStorageKey(product.image) ?? null
            : undefined,
        imageContentType:
          product.image !== undefined || product.imageContentType !== undefined
            ? product.imageContentType ?? detectImageContentType(product.image) ?? null
            : undefined,
        imageUploadedAt:
          product.image !== undefined || product.imageUploadedAt !== undefined
            ? product.imageUploadedAt
              ? new Date(product.imageUploadedAt)
              : product.image
                ? new Date()
                : null
            : undefined,
        category: product.category,
        tag: product.tag !== undefined ? product.tag : undefined,
        installments: product.installments !== undefined ? (product.installments as any) : undefined,
      } as any,
      include: {
        variants: true,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private toDomain(raw: any): Product {
    const installments = raw.installments
      ? {
          count: Number((raw.installments as any).count),
          value: Number((raw.installments as any).value),
        }
      : undefined;

    return {
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      sku: raw.sku ?? undefined,
      price: Number(raw.price),
      salePrice: raw.salePrice == null ? undefined : Number(raw.salePrice),
      originalPrice: raw.originalPrice == null ? undefined : Number(raw.originalPrice),
      stockQuantity: raw.stockQuantity == null ? undefined : Number(raw.stockQuantity),
      weight: raw.weight == null ? undefined : Number(raw.weight),
      height: raw.height == null ? undefined : Number(raw.height),
      width: raw.width == null ? undefined : Number(raw.width),
      length: raw.length == null ? undefined : Number(raw.length),
      image: raw.image,
      imageStorageProvider: raw.imageStorageProvider ?? undefined,
      imageStorageKey: raw.imageStorageKey ?? undefined,
      imageContentType: raw.imageContentType ?? undefined,
      imageUploadedAt: raw.imageUploadedAt ? new Date(raw.imageUploadedAt).toISOString() : undefined,
      category: raw.category,
      tag: raw.tag ?? undefined,
      installments,
      deletedAt: raw.deletedAt ? new Date(raw.deletedAt).toISOString() : undefined,
      variants: raw.variants
        ? raw.variants.map((variant: any) => ({
            id: variant.id,
            productId: variant.productId,
            size: variant.size,
            stock: variant.stock,
          }))
        : [],
    };
  }
}
