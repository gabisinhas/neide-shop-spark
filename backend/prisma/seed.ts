import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageFile: string;
  category: string;
  tag: string;
  installments?: { count: number; value: number };
  variants: { size: string; stock: number }[];
}

const products: SeedProduct[] = [
  {
    id: '1',
    name: 'CROPPED JULY',
    price: 59.99,
    imageFile: 'product-1.png',
    category: 'Cropped',
    tag: 'lancamento',
    installments: { count: 2, value: 30 },
    variants: [
      { size: 'P', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'G', stock: 8 },
    ],
  },
  {
    id: '2',
    name: 'VESTIDO FLORA',
    price: 79.99,
    imageFile: 'product-2.png',
    category: 'Vestido',
    tag: 'lancamento',
    installments: { count: 2, value: 40 },
    variants: [
      { size: 'P', stock: 5 },
      { size: 'M', stock: 12 },
      { size: 'G', stock: 6 },
    ],
  },
  {
    id: '3',
    name: 'SHORT LARA',
    price: 89.99,
    imageFile: 'product-3.png',
    category: 'Short',
    tag: 'lancamento',
    installments: { count: 2, value: 45 },
    variants: [
      { size: 'P', stock: 8 },
      { size: 'M', stock: 14 },
      { size: 'G', stock: 10 },
    ],
  },
  {
    id: '4',
    name: 'BLUSA CARMEN',
    price: 49.99,
    imageFile: 'product-4.png',
    category: 'Blusa',
    tag: 'lancamento',
    variants: [
      { size: 'P', stock: 20 },
      { size: 'M', stock: 25 },
      { size: 'G', stock: 15 },
    ],
  },
  {
    id: '5',
    name: 'SAIA LOLLA',
    price: 89.99,
    imageFile: 'product-5.png',
    category: 'Saia',
    tag: 'destaque',
    installments: { count: 2, value: 45 },
    variants: [
      { size: 'P', stock: 7 },
      { size: 'M', stock: 10 },
      { size: 'G', stock: 4 },
    ],
  },
  {
    id: '6',
    name: 'BODY TROPICAL',
    price: 39.99,
    originalPrice: 49.99,
    imageFile: 'product-6.png',
    category: 'Body',
    tag: 'oferta',
    variants: [
      { size: 'P', stock: 15 },
      { size: 'M', stock: 18 },
      { size: 'G', stock: 12 },
    ],
  },
  {
    id: '7',
    name: 'MACAQUINHO EVA',
    price: 69.99,
    imageFile: 'product-7.png',
    category: 'Macaquinho',
    tag: 'destaque',
    installments: { count: 2, value: 35 },
    variants: [
      { size: 'P', stock: 9 },
      { size: 'M', stock: 11 },
      { size: 'G', stock: 5 },
    ],
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  console.log('Cleaned up existing records.');

  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.name,
        sku: `SEED-${product.id}`,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        stockQuantity: product.variants.reduce((total, variant) => total + variant.stock, 0),
        weight: 0.3,
        height: 3,
        width: 24,
        length: 30,
        image: `/assets/${product.imageFile}`,
        imageStorageProvider: 'local',
        imageStorageKey: product.imageFile,
        imageContentType: product.imageFile.endsWith('.png') ? 'image/png' : 'image/jpeg',
        imageUploadedAt: new Date(),
        category: product.category,
        tag: product.tag,
        installments: product.installments ?? null,
        variants: {
          create: product.variants.map((variant) => ({
            size: variant.size,
            stock: variant.stock,
          })),
        },
      },
    });

    console.log(`Seeded: ${product.name}`);
  }

  console.log(`Seeded ${products.length} products with upload metadata.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
