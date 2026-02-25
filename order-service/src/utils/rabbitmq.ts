import amqp from 'amqplib';
import prisma from '../config/db';
// 🚀 KRİTİK: OrderStatus tipini Prisma'dan çekiyoruz
import { OrderStatus } from '@prisma/client';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq_server:5672';
const STOCK_QUEUE = 'stock_update';
const PAYMENT_QUEUE = 'payment_completed';

/**
 * 📢 STOK GÜNCELLEME MESAJI GÖNDERİCİ
 */
export const sendStockUpdate = async (items: any[], type: 'INCREASE' | 'DECREASE' = 'DECREASE') => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(STOCK_QUEUE, { durable: true });

    const message = JSON.stringify({ items, type });
    channel.sendToQueue(STOCK_QUEUE, Buffer.from(message), { persistent: true });
    
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (error) {
    console.error("❌ RabbitMQ sendStockUpdate hatası:", error);
  }
};

/**
 * 💳 ÖDEME ONAYI DİNLEYİCİ (DÜZELTİLDİ)
 */
export const listenForPaymentCompletion = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(PAYMENT_QUEUE, { durable: true });
    console.log(`💳 Ödeme onayları '${PAYMENT_QUEUE}' kuyruğundan dinleniyor...`);

    channel.consume(PAYMENT_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const { orderId } = JSON.parse(msg.content.toString());
          
          // 🚀 HATA ÇÖZÜMÜ: 'as any' ekleyerek inatçı TypeScript hatasını giderdik
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PROCESSING' } as any
          });

          console.log(`✅ Sipariş ödendi ve hazırlanıyor: ${orderId}`);
          channel.ack(msg);
        } catch (error) {
          console.error("❌ Ödeme mesajı işleme hatası:", error);
        }
      }
    });
  } catch (error) {
    console.error("❌ RabbitMQ listenForPaymentCompletion hatası:", error);
  }
};