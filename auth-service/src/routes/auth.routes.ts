import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { changePassword } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', verifyToken, changePassword);

export default router;