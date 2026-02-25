import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
// Güvenlik duvarlarımız (Sadece bunlar kalmalı)
import { verifyToken, requireAdmin } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());

// --- GÜVENLİ KİMLİK AKTARIMI ---
const appendUserInfo = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authReq = req as any;
    if (authReq.user) {
        req.headers['x-user-id'] = authReq.user.id;
        req.headers['x-user-role'] = authReq.user.role;
    }
    next();
};

// 🚦 TRAFİK RADARI (LOGS)
app.use((req, res, next) => {
    console.log(`➡️ [Gateway İstek] ${req.method} ${req.originalUrl}`);
    next();
});

// --- MİKROSERVİS YÖNLENDİRMELERİ ---

// 1. AUTH SERVICE (Giriş / Kayıt)
app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://auth-service:5000',
    changeOrigin: true,
    pathRewrite: (path, req: any) => req.originalUrl 
}));

// 2. PRODUCT SERVICE (Ürünler)
app.use('/api/products', (req: any, res: any, next: any) => {
    if (req.method === 'GET') return next(); // Herkese açık
    verifyToken(req, res, () => requireAdmin(req, res, next)); // Sadece Admin
}, createProxyMiddleware({ 
    target: 'http://product-service:5001',
    changeOrigin: true,
    pathRewrite: (path, req: any) => req.originalUrl 
}));

// 3. ORDER SERVICE (Siparişler)
app.use('/api/orders', 
    verifyToken as any, 
    appendUserInfo,
    createProxyMiddleware({ 
        // 🛠️ DÜZELTME: Docker container ismin 'order_service'
        target: 'http://order_service:5002', 
        changeOrigin: true,
        pathRewrite: (path, req: any) => req.originalUrl
    })
);

app.get('/', (req, res) => {
    res.send('🌐 API Gateway Aktif! Trafik güvenli şekilde yönlendiriliyor.');
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway ${PORT} portunda tüm sistemi yönetiyor!`);
});