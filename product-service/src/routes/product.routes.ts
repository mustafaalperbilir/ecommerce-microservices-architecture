import { Router } from 'express';
import { getAll, create, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller';
import upload from '../middlewares/upload'; // ⬅️ Middleware'i import et

const router = Router();

router.get('/', getAll);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);

// 📸 'image' anahtarıyla gelen dosyayı yakala ve Cloudinary'ye yükle
router.post('/', upload.single('image'), create); 
router.put('/:id', upload.single('image'), updateProduct);

export default router;