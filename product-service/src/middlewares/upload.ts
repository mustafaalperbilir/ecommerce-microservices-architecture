import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

// Cloudinary üzerinde depolama ayarlarını yapıyoruz
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products', // Cloudinary'de dosyaların toplanacağı klasör adı
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Sadece bu formatlara izin ver
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Otomatik boyutlandırma
  } as any,
});

const upload = multer({ storage: storage });

export default upload;