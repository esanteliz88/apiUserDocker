import { Router } from 'express';
import {
    registerUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    login,
    forgotPassword,
    resetPassword
} from '../controllers/userController.js';
import {
    verifyToken,
    isSuperAdmin,
    isAdmin,
    isCompanyAdmin,
    isSameCompany
} from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';

const router = Router();

console.log('[UserRoutes] Registrando rutas de usuarios');

// Rate limiting estricto para login y reset
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many attempts, please try again later.'
});

// Public routes
console.log('[UserRoutes] Registrando ruta pública: POST /login');
router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password required')
], login);

console.log('[UserRoutes] Registrando ruta pública: POST /forgot-password');
router.post('/forgot-password', authLimiter, [
    body('email').isEmail().withMessage('Valid email required')
], forgotPassword);

console.log('[UserRoutes] Registrando ruta pública: POST /reset-password');
router.post('/reset-password', authLimiter, [
    body('token').notEmpty().withMessage('Token required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password required')
], resetPassword);

// Nueva ruta para verificar el token
router.get('/verify-token', verifyToken, (req, res) => {
    try {
        res.json({
            message: 'Token válido',
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                companyId: req.user.companyId,
                isCompanyAdmin: req.user.isCompanyAdmin
            }
        });
    } catch (error) {
        res.status(401).json({
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
});

// Protected routes
console.log('[UserRoutes] Registrando ruta protegida: POST /register');
router.post('/register', verifyToken, isAdmin, registerUser);

console.log('[UserRoutes] Registrando ruta protegida: GET /');
router.get('/', verifyToken, isAdmin, getUsers);

console.log('[UserRoutes] Registrando ruta protegida: GET /:id');
router.get('/:id', verifyToken, isSameCompany, getUser);

console.log('[UserRoutes] Registrando ruta protegida: PUT /:id');
router.put('/:id', verifyToken, isSameCompany, updateUser);

console.log('[UserRoutes] Registrando ruta protegida: DELETE /:id');
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router; 