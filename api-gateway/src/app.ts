import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
// Yazdığımız güvenlik duvarlarını (middleware) içeri alıyoruz
import { verifyToken, requireAdmin } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// 🚦 TRAFİK RADARI
app.use((req, res, next) => {
    console.log(`➡️ [Gateway İstek Aldı] ${req.method} ${req.originalUrl}`);
    next();
});

// --- ÖZEL KORUMA MANTIKLARI (GUARDS) ---
// Ürünler için akıllı koruma: GET herkese açık, diğer her şey (POST vb.) ADMIN yetkisi ister.
const productAuthGuard = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.method === 'GET') {
        return next(); // GET istekleri herkese serbest
    }
    // Diğer tüm işlemler için önce biletine (JWT) bak, sonra Admin mi kontrol et
    verifyToken(req as any, res, () => requireAdmin(req as any, res, next));
};

// --- MİKROSERVİS YÖNLENDİRMELERİ ---

// 1. AUTH SERVICE (Güvenlik yok, giriş/kayıt serbest)
app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://auth-service:5000',
    changeOrigin: true,
    pathRewrite: (path, req: any) => req.originalUrl 
}));

// 2. PRODUCT SERVICE (Akıllı Koruma Devrede)
app.use('/api/products', productAuthGuard, createProxyMiddleware({ 
    target: 'http://product-service:5001',
    changeOrigin: true,
    pathRewrite: (path, req: any) => req.originalUrl 
}));

// 3. ORDER SERVICE (Sadece giriş yapanlar geçebilir - ADMIN şart değil)
app.use('/api/orders', verifyToken as any, createProxyMiddleware({ 
    target: 'http://order-service:5002',
    changeOrigin: true,
    pathRewrite: (path, req: any) => req.originalUrl 
}));

app.get('/', (req, res) => {
    res.send('🌐 API Gateway Aktif! Trafik yönlendiriliyor ve GÜVENLİK devrede.');
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway ${PORT} portunda tüm trafiği ve güvenliği yönetiyor!`);
});