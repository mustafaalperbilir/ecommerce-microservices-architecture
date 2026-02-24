import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);

// .env'den okuyacak, yoksa 5001'de çalışacak
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`📦 Product Service ${PORT} portunda çalışıyor.`);
});