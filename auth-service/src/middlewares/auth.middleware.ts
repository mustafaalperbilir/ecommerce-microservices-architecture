import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 🔒 GÜVENLİK KALKANI: Gelen isteğin gerçekten giriş yapmış birine ait olup olmadığını denetler.
export const verifyToken = (req: any, res: any, next: NextFunction) => {
  try {
    // 1. İsteğin başlığındaki (header) Authorization kısmından token'ı alıyoruz
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1]; // "Bearer <token>" formatından sadece token'ı ayıkla

    if (!token) {
      return res.status(401).json({ message: "Güvenlik İhlali: Erişim reddedildi, token bulunamadı." });
    }

    // 2. Token'ın sahte olup olmadığını ve süresinin geçip geçmediğini kontrol et
    // (Ortam değişkeninden gizli anahtarı alıyoruz, yoksa varsayılanı kullanıyoruz)
    const secretKey = process.env.JWT_SECRET || 'super_secret_key'; 
    const decoded = jwt.verify(token, secretKey);

    // 3. Token doğruysa, içindeki bilgileri (userId, role vb.) sonraki işlemler için req.user içine koy
    req.user = decoded; 
    
    // Her şey güvenli, işleme devam edebilirsin onayı:
    next();
  } catch (error) {
    console.error("❌ Token Doğrulama Hatası:", error);
    return res.status(403).json({ message: "Güvenlik İhlali: Geçersiz veya süresi dolmuş token." });
  }
};