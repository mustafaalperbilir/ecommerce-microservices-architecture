import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 🛑 Güvenlik: Sadece .env'den alıyoruz. Fallback (yedek) açık şifre YOK!
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Eğer DevOps ekibi .env içine şifre koymayı unutursa sistemi uyar ve durdur
    if (!JWT_SECRET) {
        console.error("🚨 KRİTİK GÜVENLİK HATASI: JWT_SECRET .env dosyasında tanımlı değil!");
        return res.status(500).json({ error: 'Sunucu yapılandırma hatası.' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Erişim reddedildi. Lütfen giriş yapın.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'ADMIN') {
        next(); 
    } else {
        return res.status(403).json({ error: 'Yetki Hatası: Bu işlemi sadece yetkililer yapabilir.' });
    }
};