import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (userId: string, role: string) => {
  const secret = process.env.JWT_SECRET;
  
  // Güvenlik: Eğer secret key yoksa, sistemi direkt çökert!
  if (!secret) {
    throw new Error('FATAL ERROR: JWT_SECRET environment variable is missing!');
  }

  // TypeScript'i ikna etmek için SignOptions tipini açıkça belirtiyoruz
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn']
  };

  return jwt.sign({ userId, role }, secret, options);
};