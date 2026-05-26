import { z } from 'zod';

const nonNegativeNumber = z.coerce.number().finite().min(0);
const positiveNumber = z.coerce.number().finite().positive();

export const idParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
});

export const addressSchema = z.object({
  recipient: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  street: z.string().trim().min(1),
  number: z.string().trim().min(1),
  district: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(2).max(2),
  zipCode: z.string().trim().min(8),
});

export const registerBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  address: addressSchema,
});

export const updateUserProfileBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: addressSchema.optional(),
});

export const updateUserRoleBodySchema = z.object({
  role: z.enum(['customer', 'admin', 'super_admin']),
});

export const googleCredentialBodySchema = z.object({
  credential: z.string().trim().min(1),
});

export const googleExchangeBodySchema = z.object({
  token: z.string().trim().min(1),
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordBodySchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(6).max(128),
});

export const createCategoryBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().min(1).max(500).optional(),
});

export const updateCategoryBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    slug: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().min(1).max(500).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo para atualizar a categoria.',
  });

export const orderListQuerySchema = z.object({
  userId: z.string().trim().min(1).optional(),
});

export const installmentsSchema = z.object({
  count: z.coerce.number().int().positive(),
  value: positiveNumber,
});

export const productVariantSchema = z.object({
  id: z.string().trim().min(1).optional(),
  productId: z.string().trim().min(1).optional(),
  size: z.string().trim().min(1),
  stock: nonNegativeNumber,
});

const productShape = {
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  price: positiveNumber,
  salePrice: positiveNumber.optional(),
  originalPrice: nonNegativeNumber.optional(),
  image: z.string().trim().min(1),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  sku: z.string().trim().min(1).optional(),
  stockQuantity: nonNegativeNumber.optional(),
  weight: nonNegativeNumber.optional(),
  height: nonNegativeNumber.optional(),
  width: nonNegativeNumber.optional(),
  length: nonNegativeNumber.optional(),
  imageStorageProvider: z.enum(['s3', 'local']).optional(),
  imageStorageKey: z.string().trim().min(1).optional(),
  imageContentType: z.string().trim().min(1).optional(),
  imageUploadedAt: z.string().trim().min(1).optional(),
  tag: z.enum(['lancamento', 'destaque', 'oferta']).optional(),
  installments: installmentsSchema.optional(),
  variants: z.array(productVariantSchema).optional(),
} satisfies Record<string, z.ZodTypeAny>;

export const createProductBodySchema = z
  .object(productShape)
  .refine((value) => value.salePrice == null || value.salePrice <= value.price, {
    message: 'Preco promocional nao pode ser maior que o preco base.',
    path: ['salePrice'],
  });

export const updateProductBodySchema = z
  .object(productShape)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo para atualizar o produto.',
  })
  .refine((value) => value.salePrice == null || value.price == null || value.salePrice <= value.price, {
    message: 'Preco promocional nao pode ser maior que o preco base.',
    path: ['salePrice'],
  });

export const orderProductSchema = z.object(productShape);

export const createOrderBodySchema = z.object({
  items: z.array(z.object({ product: orderProductSchema, quantity: z.coerce.number().int().positive() })).min(1),
  paymentMethod: z.enum(['pix', 'credit_card', 'bank_slip']),
  address: addressSchema,
  shippingService: z.enum(['pac', 'sedex']),
});

export const updateOrderStatusBodySchema = z.object({
  status: z.enum(['pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled']),
});

export const mercadoPagoCheckoutBodySchema = z.object({
  orderId: z.string().trim().min(1),
});