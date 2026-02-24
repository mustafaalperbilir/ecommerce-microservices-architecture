import { Router } from 'express';
import { create, getAll } from '../controllers/product.controller';

const router = Router();

router.post('/', create);       // Ürün ekle
router.get('/', getAll);        // Ürünleri listele

export default router;