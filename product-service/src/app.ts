import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes';
import { listenForStockUpdates } from './utils/rabbitmq'; // Yeni import

const app = express();
app.use(cors());
app.use(express.json());

// Mevcut rotaların
app.use('/api/products', productRoutes);

// 🚀 KRİTİK: Servis başlarken RabbitMQ dinlemesini başlatıyoruz
listenForStockUpdates();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🏷️ Product Service ${PORT} portunda yayında.`);
});