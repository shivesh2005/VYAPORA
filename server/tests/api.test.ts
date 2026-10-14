import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { runSeed } from '../src/seed/seed';
import { Product } from '../src/models/Product';
import { Order } from '../src/models/Order';

describe('NEXORA — AI Commerce Cloud API Integration Tests', () => {
  let customerToken: string;
  let sellerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    process.env.USE_IN_MEMORY_DB = 'true';
    await connectDB();
    await runSeed();
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Health Check Endpoint', () => {
    it('should return 200 OK with server metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toContain('NEXORA');
    });
  });

  describe('2. Authentication & Authorization Flows', () => {
    it('should login platform admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@nexora.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
      expect(res.body.token).toBeDefined();
      adminToken = res.body.token;
    });

    it('should login verified seller successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'seller@nexora.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('seller');
      expect(res.body.token).toBeDefined();
      sellerToken = res.body.token;
    });

    it('should login customer successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'customer@nexora.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('customer');
      customerToken = res.body.token;
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'customer@nexora.com', password: 'wrongPassword!@#' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should register a new customer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Vikram Joshi',
          email: 'vikram.joshi@example.com',
          password: 'securePassword123',
          role: 'customer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('customer');
    });

    it('should prevent self-assigning admin role during registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker Joe',
          email: 'hacker@example.com',
          password: 'hackerPassword123',
          role: 'admin',
        });

      expect([400, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Role-Based Access Control (RBAC)', () => {
    it('should block customer from accessing admin analytics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to access platform analytics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.analytics.totalProducts).toBeGreaterThan(20);
    });

    it('should block customer from accessing seller dashboard', async () => {
      const res = await request(app)
        .get('/api/sellers/analytics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow seller to access seller analytics', async () => {
      const res = await request(app)
        .get('/api/sellers/analytics')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.analytics).toBeDefined();
    });
  });

  describe('4. Catalog & Product Filtering', () => {
    it('should list products with pagination and category filter', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ category: 'Audio & Sound', limit: 4 });

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBeLessThanOrEqual(4);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter products by price range', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ minPrice: 2000, maxPrice: 5000 });

      expect(res.status).toBe(200);
      for (const prod of res.body.products) {
        expect(prod.price).toBeGreaterThanOrEqual(2000);
        expect(prod.price).toBeLessThanOrEqual(5000);
      }
    });
  });

  describe('5. Cart, Coupons & Order Creation', () => {
    let testProductId: string;

    it('should fetch product and add it to cart', async () => {
      const prodRes = await request(app).get('/api/products').query({ limit: 1 });
      testProductId = prodRes.body.products[0]._id;

      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProductId, quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.cart.items.length).toBeGreaterThan(0);
    });

    it('should validate and apply coupon NEXORA10', async () => {
      const res = await request(app)
        .post('/api/cart/coupon')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ couponCode: 'NEXORA10' });

      expect(res.status).toBe(200);
      expect(res.body.summary.appliedCoupon).toBe('NEXORA10');
      expect(res.body.summary.discountAmount).toBeGreaterThan(0);
    });

    it('should create an order with server-side inventory deduction', async () => {
      const initialProd = await Product.findById(testProductId);
      const initialStock = initialProd!.stock;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddress: {
            fullName: 'Rohan Sharma',
            phone: '+91 98765 43210',
            street: '123 Cloud Way',
            city: 'Bengaluru',
            state: 'Karnataka',
            zipCode: '560001',
          },
          paymentMethod: 'demo_card',
        });

      expect(res.status).toBe(201);
      expect(res.body.order.orderNumber).toBeDefined();
      expect(res.body.order.orderStatus).toBe('Confirmed');

      // Verify stock was reduced
      const updatedProd = await Product.findById(testProductId);
      expect(updatedProd!.stock).toBe(initialStock - 2);
    });
  });

  describe('6. Nexora AI Assistant', () => {
    it('should handle catalog-grounded AI shopping query', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({
          message: 'Find the best headphones under 7000',
        });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body.mode).toBeDefined();
    });
  });

  describe('7. SaaS Subscriptions & Entitlements', () => {
    it('should list all subscription plans', async () => {
      const res = await request(app).get('/api/subscriptions/plans');
      expect(res.status).toBe(200);
      expect(res.body.plans.length).toBe(3);
    });

    it('should return seller active subscription', async () => {
      const res = await request(app)
        .get('/api/subscriptions/my')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.subscription.status).toBe('active');
    });
  });

  describe('8. Contact Us & Newsletter', () => {
    it('should submit contact message', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Aarav Mehta',
          email: 'aarav@example.com',
          subject: 'Partnership Inquiry',
          message: 'We are interested in listing our designer brand on Nexora.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should subscribe to newsletter', async () => {
      const res = await request(app)
        .post('/api/contact/newsletter')
        .send({ email: 'insider@example.com' });

      expect(res.status).toBe(201);
    });
  });
});
