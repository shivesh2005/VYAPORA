import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      fullName: z.string().min(2, 'Full name is required'),
      phone: z.string().min(7, 'Phone number is required'),
      street: z.string().min(5, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().min(3, 'ZIP/Postal code is required'),
      country: z.string().default('India'),
    }),
    paymentMethod: z.enum(['demo_card', 'demo_upi', 'cod']).default('demo_card'),
    couponCode: z.string().optional(),
  }),
});
