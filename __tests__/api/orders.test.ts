import { POST } from '../../src/app/api/orders/route';
import { createMocks } from 'node-mocks-http';

import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mPrisma = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrisma),
  };
});

const prisma = new PrismaClient();

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_test_123', client_secret: 'secret_test_123' }),
    },
  }));
});

describe('/api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order successfully with PIN and OrderNumber', async () => {
    (prisma.order.create as jest.Mock).mockResolvedValue({
      id: 'order_1',
      orderNumber: 'CMD-1234',
      pinCode: '5678',
      status: 'PAID_ESCROW',
    });

    const { req } = createMocks({
      method: 'POST',
      body: {
        storeId: 'store_1',
        clientId: 'client_1',
        items: [{ productId: 'prod_1', quantity: 2, price: 10 }],
        totalAmount: 20,
        deliveryAddress: 'Test Address',
      },
    });

    // We pass req as a generic Request since Next.js uses standard Request
    const standardReq = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });

    const response = await POST(standardReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderNumber).toBeDefined();
    expect(data.pinCode).toBeDefined();
    
    // Verify Prisma was called correctly
    expect(prisma.order.create).toHaveBeenCalledTimes(1);
    const createArgs = (prisma.order.create as jest.Mock).mock.calls[0][0];
    expect(createArgs.data.storeId).toBe('store_1');
    expect(createArgs.data.clientId).toBe('client_1');
    expect(createArgs.data.totalAmount).toBe(20);
    expect(createArgs.data.deliveryFee).toBe(2.50); 
    expect(createArgs.data.pinCode).toMatch(/^\d{4}$/); // 4 digits
  });

  it('should fail if missing required fields', async () => {
    const standardReq = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({}), // Empty body
    });

    const response = await POST(standardReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
