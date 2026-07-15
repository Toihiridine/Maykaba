import { POST as StorePickup } from '../../src/app/api/deliveries/pickup/store/route';
import { POST as CourierPickup } from '../../src/app/api/deliveries/pickup/courier/route';
import { POST as ValidateDelivery } from '../../src/app/api/deliveries/validate/route';

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

describe('Deliveries API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/deliveries/pickup/store', () => {
    it('should set storeValidatedPickup to true', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_1', status: 'PAID_ESCROW', storeId: 'store_1', storeValidatedPickup: false
      });
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order_1' });

      const req = new Request('http://localhost/api/deliveries/pickup/store', {
        method: 'POST',
        body: JSON.stringify({ orderNumber: 'CMD-123', storeId: 'store_1' }),
      });

      const res = await StorePickup(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order_1' },
        data: expect.objectContaining({ storeValidatedPickup: true }),
      }));
    });
  });

  describe('/api/deliveries/pickup/courier', () => {
    it('should set courierValidatedPickup and change status to PICKED_UP if store validated', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_1', status: 'PAID_ESCROW', storeValidatedPickup: true, courierValidatedPickup: false
      });
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order_1' });

      const req = new Request('http://localhost/api/deliveries/pickup/courier', {
        method: 'POST',
        body: JSON.stringify({ orderNumber: 'CMD-123', courierId: 'courier_1' }),
      });

      const res = await CourierPickup(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'PICKED_UP', courierValidatedPickup: true }),
      }));
    });
  });

  describe('/api/deliveries/validate', () => {
    it('should fail if PIN is incorrect', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_1', status: 'PICKED_UP', pinCode: '1234', courierId: 'courier_1'
      });

      const req = new Request('http://localhost/api/deliveries/validate', {
        method: 'POST',
        body: JSON.stringify({ orderId: 'order_1', pinCode: '9999', courierId: 'courier_1' }),
      });

      const res = await ValidateDelivery(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Code PIN incorrect');
    });

    it('should succeed and change status to COMPLETED if PIN is correct', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_1', status: 'PICKED_UP', pinCode: '1234', courierId: 'courier_1', deliveryFee: 4
      });
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order_1' });

      const req = new Request('http://localhost/api/deliveries/validate', {
        method: 'POST',
        body: JSON.stringify({ orderId: 'order_1', pinCode: '1234', courierId: 'courier_1' }),
      });

      const res = await ValidateDelivery(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: 'COMPLETED', courierId: 'courier_1' },
      }));
    });
  });
});
