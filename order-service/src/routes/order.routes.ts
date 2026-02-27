import { Router } from 'express';
import { create, getMyOrders, getAll, updateStatus, requestOrderAction } from '../controllers/order.controller';

// 🚀 GÜVENLİK: Kullanıcının kimliğini token'dan okumak için middleware'i ekliyoruz.
import { verifyToken } from '../middlewares/auth.middleware'; 

const router = Router();

// Yeni sipariş oluşturma (Eğer bunu da sadece giriş yapanlar yapabiliyorsa yanına verifyToken ekleyebilirsin)
router.post('/', create);

// 🚀 ÇÖZÜM: Frontend'in 404 almaması için rotayı tam olarak '/my-orders' yaptık ve güvenliğe aldık.
router.get('/my-orders', verifyToken, getMyOrders); 

// Admin Rotaları
router.get('/', getAll); // Tüm siparişler
router.put('/:id/status', updateStatus); // Durum güncelleme
router.put('/:id/request-action', verifyToken, requestOrderAction);

export default router;