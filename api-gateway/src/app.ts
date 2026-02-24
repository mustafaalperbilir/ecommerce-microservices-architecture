import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());

// 🚦 TRAFİK RADARI
app.use((req, res, next) => {
    console.log(`➡️ [Gateway İstek Aldı] ${req.method} ${req.originalUrl}`);
    next();
});

// --- MİKROSERVİS YÖNLENDİRMELERİ ---
// (Express'in yolu kesmesini engellemek için pathRewrite ekledik)

app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://auth-service:5000', // 127.0.0.1 yerine auth-service
    changeOrigin: true,
    pathRewrite: (path, req: any) => req.originalUrl 
}));

app.use('/api/products', createProxyMiddleware({ 
    target: 'http://product-service:5001', // 127.0.0.1 yerine product-service
    changeOrigin: true,
    pathRewrite: (path, req: any) => req.originalUrl 
}));

app.use('/api/orders', createProxyMiddleware({ 
    target: 'http://order-service:5002', // 127.0.0.1 yerine order-service
    changeOrigin: true,
    pathRewrite: (path, req: any) => req.originalUrl 
}));
app.get('/', (req, res) => {
    res.send('🌐 API Gateway Aktif! Trafik yönlendirilmeye hazır.');
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway ${PORT} portunda tüm trafiği yönetiyor!`);
});