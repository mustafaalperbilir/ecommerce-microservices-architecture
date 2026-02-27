import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 🔒 GÜVENLİK KALKANI: Merkezi .env dosyasındaki anahtarı kullanır
export const verifyToken = (req: any, res: any, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: "Güvenlik İhlali: Erişim reddedildi, token bulunamadı." 
      });
    }

    // 🚀 REVİZE: Ortam değişkenini alıyoruz
    const secretKey = process.env.JWT_SECRET;

    // 🚀 KRİTİK KONTROL: Eğer anahtar sistemde yoksa servisi durdur ve uyar
    if (!secretKey) {
      console.error("❌ KRİTİK GÜVENLİK HATASI: JWT_SECRET tanımlanmamış!");
      return res.status(500).json({ 
        message: "Sunucu yapılandırma hatası (Güvenlik anahtarı eksik)." 
      });
    }

    // 🚀 REVİZE: TypeScript'in 'string | undefined' hatasını önlemek için anahtarı doğruluyoruz
    const decoded = jwt.verify(token, secretKey);

    // Token içindeki kullanıcı bilgilerini (id, role vb.) isteğe ekle
    req.user = decoded; 
    
    next();
  } catch (error) {
    // 🚀 ÇÖZÜM: 403 hatasının detaylarını terminalde görmek için logluyoruz
    console.error("❌ Token Doğrulama Başarısız:", error);
    return res.status(403).json({ 
      message: "Güvenlik İhlali: Geçersiz veya süresi dolmuş token." 
    });
  }
};