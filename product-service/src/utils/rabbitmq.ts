import amqp from 'amqplib';
// 🚀 KRİTİK EKLEME: Prisma'yı içeri almazsak veritabanını güncelleyemeyiz!
import prisma from '../config/db'; 

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq_server:5672';
const queue = 'stock_update';

export const listenForStockUpdates = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    console.log(`📦 Ürün Servisi: '${queue}' kuyruğu üzerinden stok güncellemeleri dinleniyor...`);

   channel.consume(queue, async (msg) => {
  if (msg !== null) {
    const { items, type } = JSON.parse(msg.content.toString());
    
    for (const item of items) {
      // 🧠 ZEKİ MANTIK: 
      // INCREASE ise gelen adedi pozitif (+), DECREASE ise negatif (-) yapıyoruz.
      const changeAmount = type === 'INCREASE' ? Math.abs(item.quantity) : -Math.abs(item.quantity);

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: changeAmount // Prisma negatif gelirse azaltır, pozitif gelirse artırır.
          }
        }
      });
    }
    channel.ack(msg);
  }
});
  } catch (error) {
    console.error("❌ RabbitMQ Dinleme Hatası:", error);
  }
};