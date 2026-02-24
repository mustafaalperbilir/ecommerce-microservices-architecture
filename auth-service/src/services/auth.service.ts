import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.util';

// KAYIT OLMA İŞ MANTIĞI
export const registerUser = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Bu email adresi zaten kullanılıyor.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// GİRİŞ YAPMA İŞ MANTIĞI (Burada req, res YOK!)
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Geçersiz email veya şifre.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Geçersiz email veya şifre.');
  }

  const token = generateToken(user.id, user.role);

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};