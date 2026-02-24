import { Request, Response } from 'express';
import { createOrder, getUserOrders } from '../services/order.service';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || items.length === 0) {
      res.status(400).json({ error: 'Kullanıcı ID ve en az bir ürün gereklidir.' });
      return;
    }

    // Servis katmanına 2 parametre gönderiyoruz (Aynı dilden konuşuyorlar)
    const order = await createOrder(userId, items);
    
    res.status(201).json({ message: 'Sipariş başarıyla oluşturuldu (PENDING)', order });
    
  } catch (error) {
  // HATAYI TERMİNALDE GÖRMEK İÇİN BU SATIRI EKLE
  console.error("CRITICAL_ORDER_ERROR:", error); 
  
  const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
  res.status(500).json({ error: errorMessage });
}
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const orders = await getUserOrders(userId);
    res.status(200).json(orders);
  } catch (error) {
  // HATAYI TERMİNALDE GÖRMEK İÇİN BU SATIRI EKLE
  console.error("CRITICAL_ORDER_ERROR:", error); 
  
  const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
  res.status(500).json({ error: errorMessage });
}
};