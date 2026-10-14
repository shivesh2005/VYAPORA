import { z } from 'zod';

export const updateStoreSchema = z.object({
  body: z.object({
    storeName: z.string().min(2).optional(),
    description: z.string().optional(),
    logoUrl: z.string().url().optional().or(z.literal('')),
    bannerUrl: z.string().url().optional().or(z.literal('')),
    brandAccentColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code').optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    contactPhone: z.string().optional(),
    layoutSettings: z
      .object({
        theme: z.enum(['modern', 'minimal', 'bold']).optional(),
        showBanner: z.boolean().optional(),
        featuredTagline: z.string().optional(),
        productGridColumns: z.number().min(2).max(6).optional(),
      })
      .optional(),
  }),
});

export const contactMessageSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    subject: z.string().min(3, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),
});

export const newsletterSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
  }),
});
