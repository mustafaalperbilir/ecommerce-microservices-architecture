import prisma from '../config/db';
import { publishToQueue } from '../utils/rabbitmq';

interface OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export const createOrder = async (userId: string, items: OrderItemDto[]) => {
  // 1. Toplam sipariş tutarını hesapla
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 2. Transaction benzeri bir yapıyla (Prisma nested create) Order ve OrderItem'ları tek seferde kaydet
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      // status otomatik olarak 'PENDING' atanacak (şemadaki @default sayesinde)
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: {
      items: true // Kaydedilen alt ürünleri de cevapta görmek için
    }
  });

 

  // YENİ EKLENEN KISIM: RabbitMQ'ya "order_created" isimli bir mesaj fırlat
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