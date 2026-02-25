import prisma from '../config/db';
// 🚀 KRİTİK: OrderStatus'u doğrudan buradan alıyoruz
import { OrderStatus } from '@prisma/client';
import { sendStockUpdate } from '../utils/rabbitmq';

export const createOrder = async (userId: string, items: any[], totalAmount: number) => {
  // 1. Önce siparişi veritabanına oluşturuyoruz
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

  // 🚀 2. SİHİRLİ DOKUNUŞ: Sipariş oluşunca açıkça 'DECREASE' (Azalt) mesajı gönderiyoruz
  try {
    console.log("📢 Sipariş başarıyla oluşturuldu, stoklar düşürülüyor...");
    await sendStockUpdate(items, 'DECREASE'); 
  } catch (error) {
    console.error("❌ RabbitMQ mesajı gönderilirken hata oluştu:", error);
  }

  return order;
};

export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * 🚀 updateStatus: Durum günceller ve iptal/iade durumunda stokları iade eder.
 */
export const updateStatus = async (orderId: string, status: OrderStatus, cancelReason?: string) => {
  // 1. Önce siparişi güncelliyoruz (ve içindeki ürünleri çekiyoruz)
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { 
      status,
      cancelReason: cancelReason || null 
    } as any,
    include: { items: true } // 🚀 Stok iadesi için ürün listesi şart
  });

  // 🚀 2. STOK İADE MANTIĞI: Eğer iptal veya iade edildiyse 'INCREASE' (Artır) mesajı at
  const currentStatus = status as string;
  
  if (currentStatus === 'CANCELLED' || currentStatus === 'RETURNED') {
    try {
      console.log(`📢 Sipariş ${currentStatus} oldu. Stoklar Ürün Servisi'ne iade ediliyor...`);
      // Burada zaten 'INCREASE' parametresini kullanıyoruz, bu kısım doğru.
      await sendStockUpdate(order.items, 'INCREASE');
    } catch (error) {
      console.error("❌ İptal stok güncelleme mesajı gönderilemedi:", error);
    }
  }

  return order;
};