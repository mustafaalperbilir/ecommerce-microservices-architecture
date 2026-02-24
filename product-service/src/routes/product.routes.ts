import { Router } from 'express';
// Senin controller'ındaki GERÇEK isimlerle çağırdık: getAll ve create
import { getAll, create, getProductById } from '../controllers/product.controller';

const router = Router();

// Mevcut Rotalar (Bütün ürünleri getir ve ürün ekle)
router.get('/', getAll);
router.post('/', create);

// YENİ EKLENEN ROTA (Sadece bir ID'ye ait ürünü getir)
router.get('/:id', getProductById); 

export default router;