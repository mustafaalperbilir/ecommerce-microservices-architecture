import { Router } from 'express';
import { create, getMyOrders } from '../controllers/order.controller';

const router = Router();

router.post('/', create);
router.get('/:userId', getMyOrders); 

export default router;