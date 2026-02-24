import { Request, Response } from 'express';
import { createOrder, getUserOrders } from '../services/order.service';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || items.length === 0) {
      res.status(400).json({ error: 'Kullanıcı ID ve en az bir ürün gereklidir.' });
      return;
    }

    const order = await createOrder(userId, items);
    res.status(201).json({ message: 'Sipariş başarıyla oluşturuldu (PENDING)', order });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // TypeScript'e bunun kesinlikle bir string olduğunu 'as string' ile belirtiyoruz
    const userId = req.params.userId as string;
    
    const orders = await getUserOrders(userId);
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};