import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    brand: z.string().min(1, 'Brand is required'),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().optional(),
    images: z.array(z.string().url()).min(1, 'At least one image URL is required'),
    price: z.number().min(0, 'Price must be positive'),
    compareAtPrice: z.number().min(0).optional(),
    discountBadge: z.string().optional(),
    sku: z.string().min(3, 'SKU is required'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    variants: z
      .array(
        z.object({
          name: z.string().min(1),
          options: z.array(z.string().min(1)).min(1),
        })
      )
      .optional(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});
