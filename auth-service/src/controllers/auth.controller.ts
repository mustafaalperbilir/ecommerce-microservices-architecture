import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

// KAYIT OLMA KONTROLCÜSÜ
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email ve şifre zorunludur.' });
      return;
    }

    const user = await registerUser(email, password);
    res.status(201).json({ message: 'Kayıt başarılı', user });
    
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// GİRİŞ YAPMA KONTROLCÜSÜ (req ve res BURADA olur!)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email ve şifre zorunludur.' });
      return;
    }

    const data = await loginUser(email, password);
    res.status(200).json({ message: 'Giriş başarılı', ...data });
    
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};