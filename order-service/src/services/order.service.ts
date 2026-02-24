import prisma from '../config/db';
import { publishToQueue } from '../utils/rabbitmq';

interface OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export const createOrder = async (userId: string, items: OrderItemDto[]) => {
  // 1. Güvenlik: Toplam tutarı backend'de tekrar hesaplıyoruz
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 2. Prisma ile siparişi kaydediyoruz
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: { items: true }
  });

  // 3. RabbitMQ'ya haber ver
  await publishToQueue('order_created', {
    orderId: order.id,
    userId: order.userId,
    totalAmount: order.totalAmount
  });
  
  return order; 
};

export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
};