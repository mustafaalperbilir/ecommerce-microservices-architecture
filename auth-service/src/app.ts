import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes'; // Rotaları import ettik

const app = express();

app.use(cors());
app.use(express.json());

// API Gateway üzerinden istekler genelde /api/auth şeklinde gelecektir
app.use('/api/auth', authRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔐 Auth Service ${PORT} portunda çalışıyor.`);
});