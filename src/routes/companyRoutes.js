import { Router } from 'express';
import {
    registerCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany
} from '../controllers/companyController.js';
import {
    verifyToken,
    isSuperAdmin,
    isCompanyAdmin,
    belongsToCompany
} from '../middleware/auth.js';
import { body } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /api/companies/register:
 *   post:
 *     summary: Registrar una nueva compañía
 *     tags: [Compañías]
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
 *                 example: Mi Empresa
 *               email:
 *                 type: string
 *                 example: empresa@correo.com
 *               password:
 *                 type: string
 *                 example: clave123
 *               adminName:
 *                 type: string
 *                 example: Admin Empresa
 *               adminEmail:
 *                 type: string
 *                 example: admin@empresa.com
 *               adminPassword:
 *                 type: string
 *                 example: adminclave123
 *     responses:
 *       200:
 *         description: Compañía creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Compañía ya existe
 */

// Company registration (only superadmin)
router.post('/register',
    verifyToken,
    isSuperAdmin,
    [
        body('name').trim().notEmpty().withMessage('Company name is required'),
        body('email').isEmail().withMessage('Valid company email required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('adminName').trim().notEmpty().withMessage('Admin name is required'),
        body('adminEmail').isEmail().withMessage('Valid admin email required'),
        body('adminPassword').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters')
    ],
    registerCompany
);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Listar compañías
 *     tags: [Compañías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de compañías
 *       401:
 *         description: No autorizado
 */

// Get all companies (only superadmin)
router.get('/', verifyToken, isSuperAdmin, getCompanies);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Obtener compañía por ID
 *     tags: [Compañías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la compañía
 *     responses:
 *       200:
 *         description: Compañía encontrada
 *       404:
 *         description: Compañía no encontrada
 */

// Get company by ID (superadmin or company admin)
router.get('/:id', verifyToken, belongsToCompany, getCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Actualizar compañía
 *     tags: [Compañías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la compañía
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
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Compañía actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Compañía no encontrada
 */

// Update company (superadmin or company admin)
router.put('/:id',
    verifyToken,
    belongsToCompany,
    [
        body('name').optional().trim().notEmpty().withMessage('Company name is required'),
        body('email').optional().isEmail().withMessage('Valid company email required'),
        body('active').optional().isBoolean().withMessage('Active must be boolean')
    ],
    updateCompany
);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Eliminar compañía
 *     tags: [Compañías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la compañía
 *     responses:
 *       200:
 *         description: Compañía eliminada
 *       404:
 *         description: Compañía no encontrada
 */

// Delete company (only superadmin)
router.delete('/:id', verifyToken, isSuperAdmin, deleteCompany);

export default router; 