import * as z from 'zod';

const resolveFieldError =
  ({ required, invalid }: { required: string; invalid: string }) =>
  (issue: z.core.$ZodRawIssue) =>
    issue.code === 'invalid_type' && issue.input === undefined ? required : invalid;

const ProductNameRequestSchema = z.string({
  error: '상품명은 필수입니다.',
});

const ProductNameSchema = ProductNameRequestSchema.min(1, { error: '상품명은 필수입니다.' }).max(
  100,
  { error: '상품명은 최대 100자까지 허용됩니다.' },
);

const ProductImageRequestSchema = z.string({
  error: '상품 이미지는 필수입니다.',
});

const ProductImageSchema = ProductImageRequestSchema.min(1, {
  error: '상품 이미지는 필수입니다.',
});

const ProductPriceRequestSchema = z.number({
  error: resolveFieldError({
    required: '가격은 필수입니다.',
    invalid: '가격은 0보다 큰 숫자여야 합니다.',
  }),
});

const ProductPriceSchema = ProductPriceRequestSchema.int({
  error: '가격은 0보다 큰 숫자여야 합니다.',
}).min(1, { error: '가격은 0보다 큰 숫자여야 합니다.' });

const ProductStockRequestSchema = z.number({
  error: resolveFieldError({
    required: '재고는 필수입니다.',
    invalid: '재고는 0 이상 99 이하의 정수여야 합니다.',
  }),
});

const ProductStockSchema = ProductStockRequestSchema.int({
  error: '재고는 0 이상 99 이하의 정수여야 합니다.',
})
  .min(0, { error: '재고는 0 이상 99 이하의 정수여야 합니다.' })
  .max(99, { error: '재고는 0 이상 99 이하의 정수여야 합니다.' });

const ProductIdRequestSchema = z.string({
  error: '상품 ID는 필수입니다.',
});

const ProductIdSchema = ProductIdRequestSchema.min(1, {
  error: '상품 ID는 필수입니다.',
});

const ProductIdParamsSchema = z.string();

const CartItemIdParamsSchema = z.string();

const QuantityRequestSchema = z.number({
  error: resolveFieldError({
    required: '수량은 필수입니다.',
    invalid: '수량은 1 이상 99 이하의 정수여야 합니다.',
  }),
});

const QuantitySchema = QuantityRequestSchema.int({
  error: '수량은 1 이상 99 이하의 정수여야 합니다.',
})
  .min(1, { error: '수량은 1 이상 99 이하의 정수여야 합니다.' })
  .max(99, { error: '수량은 1 이상 99 이하의 정수여야 합니다.' });

const ProductRequestSchema = z.object({
  name: ProductNameRequestSchema,
  price: ProductPriceRequestSchema,
  image: ProductImageRequestSchema,
  stock: ProductStockRequestSchema,
});

export const InsertProductRequestBodySchema = ProductRequestSchema;

export const DeleteProductRequestParamsSchema = z.object({
  productId: ProductIdParamsSchema,
});

const CartItemRequestSchema = z.object({
  productId: ProductIdRequestSchema,
  quantity: QuantityRequestSchema,
});

export const InsertCartItemBodySchema = CartItemRequestSchema;

export const UpdateCartItemRequestParamsSchema = z.object({
  cartItemId: CartItemIdParamsSchema,
});

export const UpdateCartItemRequestBodySchema = CartItemRequestSchema.pick({ quantity: true });

export const DeleteCartItemRequestParamsSchema = UpdateCartItemRequestParamsSchema;

export const ProductSchema = z.object({
  name: ProductNameSchema,
  price: ProductPriceSchema,
  image: ProductImageSchema,
  stock: ProductStockSchema,
});

export const CartItemSchema = z.object({
  productId: ProductIdSchema,
  quantity: QuantitySchema,
});
