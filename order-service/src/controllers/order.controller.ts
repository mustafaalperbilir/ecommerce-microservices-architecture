import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

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

// 2. Kullanıcının Kendi Siparişlerini Görmesi
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🛠️ ÇÖZÜM: 'as string' ekleyerek TypeScript'i sakinleştirdik
    const userId = req.params.userId as string; 
    const orders = await orderService.getUserOrders(userId);
    res.status(200).json(orders);
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

