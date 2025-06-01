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

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@admin.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Datos inválidos
 */
// Public routes
console.log('[UserRoutes] Registrando ruta pública: POST /login');
router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password required')
], login);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@admin.com
 *     responses:
 *       200:
 *         description: Si el email existe, se envían instrucciones
 *       400:
 *         description: Datos inválidos
 */
console.log('[UserRoutes] Registrando ruta pública: POST /forgot-password');
router.post('/forgot-password', authLimiter, [
    body('email').isEmail().withMessage('Valid email required')
], forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Resetear contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: token123
 *               newPassword:
 *                 type: string
 *                 example: nuevaclave123
 *     responses:
 *       200:
 *         description: Contraseña reseteada exitosamente
 *       400:
 *         description: Datos inválidos
 */
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

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@empresa.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Usuario ya existe
 */
// Protected routes
console.log('[UserRoutes] Registrando ruta protegida: POST /register');
router.post('/register',
    verifyToken,
    isAdmin,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').notEmpty().withMessage('Role is required')
    ],
    registerUser
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autorizado
 */
console.log('[UserRoutes] Registrando ruta protegida: GET /');
router.get('/', verifyToken, isAdmin, getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
console.log('[UserRoutes] Registrando ruta protegida: GET /:id');
router.get('/:id', verifyToken, isSameCompany, getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 */
console.log('[UserRoutes] Registrando ruta protegida: PUT /:id');
router.put('/:id',
    verifyToken,
    isSameCompany,
    [
        body('name').optional().trim().notEmpty().withMessage('Name is required'),
        body('email').optional().isEmail().withMessage('Valid email required'),
        body('role').optional().notEmpty().withMessage('Role is required'),
        body('active').optional().isBoolean().withMessage('Active must be boolean')
    ],
    updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
console.log('[UserRoutes] Registrando ruta protegida: DELETE /:id');
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router; 