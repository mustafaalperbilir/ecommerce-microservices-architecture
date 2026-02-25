import { Router } from 'express';
import { create, getMyOrders, getAll, updateStatus } from '../controllers/order.controller';

const router = Router();

router.post('/', create);
router.get('/user/:userId', getMyOrders); // Kullanıcının siparişleri
router.get('/', getAll); // Tüm siparişler (Admin)
router.put('/:id/status', updateStatus); // Durum güncelleme (Admin)

export default router;