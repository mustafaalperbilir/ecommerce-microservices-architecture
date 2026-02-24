import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/order.routes';
import { listenForPaymentCompletion } from './utils/rabbitmq';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🛒 Order Service ${PORT} portunda çalışıyor.`);
});

listenForPaymentCompletion();