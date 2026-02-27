import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'cok-gizli-super-guvenli-bir-anahtar-2026';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // 1. Email daha önce alınmış mı kontrolü
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor.' });
    }

    // 2. Şifreyi Kriptolama (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Kullanıcıyı Veritabanına Kaydet
    // Güvenlik: Dışarıdan zorla farklı rol gönderilirse diye kontrol edebilirsin, 
    // şimdilik test amaçlı dışarıdan gelen rolü kabul ediyoruz veya USER atıyoruz.
    const newUser = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    // Eski satırı silip geçici olarak sadece şunu yazıyoruz:
    role: role === 'ADMIN' ? Role.ADMIN : Role.USER
  },
});
    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.', userId: newUser.id });
  } catch (error) {
    console.error('Register Hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Kullanıcıyı email ile bul
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // 2. Şifreyi doğrula (Girilen şifre ile veritabanındaki Hash'i karşılaştır)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Hatalı şifre.' });
    }

    // 3. JWT Token Üret (İçine kullanıcının ID'sini ve ROLÜNÜ şifreliyoruz)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' } // Token 1 gün sonra geçersiz olacak
    );

    res.status(200).json({
      message: 'Giriş başarılı.',
      token, // Frontend bu token'ı LocalStorage veya Cookie'de saklayacak
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login Hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};


export const changePassword = async (req: any, res: any) => {
  try {
    // 🚀 2. GÜVENLİK VE UYUM: Token'dan id mi yoksa userId mi geliyor iki ihtimali de kapsıyoruz.
    const userId = req.user?.id || req.user?.userId;
    
    // Eğer ID bulunamazsa çökmesin, düzgünce uyarı versin
    if (!userId) {
      return res.status(401).json({ message: "Güvenlik İhlali: Kullanıcı kimliği doğrulanamadı." });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mevcut şifre ve yeni şifre zorunludur." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Güvenlik: Yeni şifre en az 6 karakter olmalıdır." });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mevcut şifre ve yeni şifre zorunludur." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Güvenlik: Yeni şifre en az 6 karakter olmalıdır." });
    }

    // 🚀 YENİ EKLENEN KONTROL: Eski ve yeni şifre aynı olamaz
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "Yeni şifreniz eskisiyle aynı olamaz, lütfen farklı bir şifre belirleyin." });
    }

    // ... (geri kalan veritabanı Prisma işlemleri aynı kalacak)

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mevcut şifrenizi yanlış girdiniz." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: "Şifreniz başarıyla ve güvenli bir şekilde güncellendi." });
  } catch (error) {
    // 🚀 3. HATAYI YAKALAMA: Eğer yine çökerse terminalde kabak gibi göreceğiz
    console.error("❌ Şifre değiştirme hatası detaylı log:", error);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};