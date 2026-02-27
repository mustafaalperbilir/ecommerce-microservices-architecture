import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import prisma from '../config/db';

// 1. Yeni Sipariş Oluşturma
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, items, totalAmount } = req.body;

    if (!userId || !items || items.length === 0) {
      res.status(400).json({ error: 'Kullanıcı bilgisi veya ürün eksik.' });
      return;
    }

    const order = await orderService.createOrder(userId, items, totalAmount);
    res.status(201).json({ message: 'Sipariş başarıyla alındı 🎉', order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



// 3. Admin İçin Tüm Siparişleri Getirme
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error: any) {
    // 🚀 KRİTİK DOKUNUŞ: Hatayı buraya yazdırıyoruz ki Docker loglarında görebilelim
    console.error("❌ Order Service getAll Hatası:", error); 
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    // 🚀 YENİ: cancelReason bilgisini de istekten (body) alıyoruz
    const { status, cancelReason } = req.body; 
    
    // Service kısmına hem ID, hem yeni durum, hem de varsa sebebi gönderiyoruz
    const order = await orderService.updateStatus(id, status, cancelReason);
    
    res.status(200).json(order);
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    res.status(500).json({ error: 'Durum güncellenemedi' });
  }
};



// Kullanıcının sadece KENDİ siparişlerini getiren fonksiyon
export const getMyOrders = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Güvenlik İhlali: Kullanıcı kimliği doğrulanamadı." });
    }

    // 🚀 ÇÖZÜM: include: { items: true } ekleyerek siparişin içindeki ürünleri de istiyoruz
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true } // SADECE BU SATIRI EKLEDİK
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Siparişleri getirme hatası:", error);
    res.status(500).json({ message: "Siparişler alınırken sunucu hatası oluştu." });
  }
};


export const requestOrderAction = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // Frontend'den 'reason' olarak geliyor
    const userId = req.user?.id || req.user?.userId;

    const order = await prisma.order.findUnique({ where: { id: id } });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: "Sipariş bulunamadı veya bu işlem için yetkiniz yok." });
    }

    // Sebep kontrolü (En az 5 karakter)
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ message: "Lütfen geçerli bir neden belirtiniz (En az 5 karakter)." });
    }

    let newStatus: any = order.status;

    if (action === 'CANCEL') {
      if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
        return res.status(400).json({ message: "Siparişiniz hazırlık aşamasını geçtiği için iptal edilemez." });
      }
      newStatus = 'CANCEL_REQUESTED';
    } else if (action === 'RETURN') {
      if (order.status !== 'DELIVERED') {
        return res.status(400).json({ message: "Sadece teslim edilen siparişler için iade talebi oluşturulabilir." });
      }
      newStatus = 'RETURN_REQUESTED';
    }

    // 🚀 ŞEMANA UYGUN GÜNCELLEME: 'cancelReason' alanını dolduruyoruz
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { 
        status: newStatus,
        cancelReason: reason // Senin şemandaki alan adı
      }
    });

    res.status(200).json({ 
      message: action === 'CANCEL' ? "İptal talebiniz alındı." : "İade talebiniz iletildi.",
      order: updatedOrder 
    });
  } catch (error) {
    console.error("Talep işleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};
