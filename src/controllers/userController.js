import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { validationResult } from 'express-validator';

// Register a new user
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const companyId = req.user.companyId;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                email,
                companyId
            }
        });

        if (existingUser) {
            return next(ApiError.conflict('User already exists in this company', {
                field: 'email',
                value: email
            }));
        }

        // Create the user
        const user = await User.create({
            name,
            email,
            password,
            role,
            companyId
        });

        return res.json({
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get all users of the company
export const getUsers = async (req, res, next) => {
    try {
        const companyId = req.user.companyId;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: users } = await User.findAndCountAll({
            where: { companyId },
            attributes: ['id', 'name', 'email', 'role', 'active', 'createdAt'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return res.json({
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get user by ID
export const getUser = async (req, res, next) => {
    try {
        const companyId = req.user.companyId;
        const user = await User.findOne({
            where: {
                id: req.params.id,
                companyId
            },
            attributes: ['id', 'name', 'email', 'role', 'active', 'createdAt']
        });

        if (!user) {
            return next(ApiError.notFound('User not found'));
        }

        return res.json({ user });
    } catch (error) {
        next(error);
    }
};

// Update user
export const updateUser = async (req, res, next) => {
    try {
        const { name, email, role, active } = req.body;
        const companyId = req.user.companyId;

        const user = await User.findOne({
            where: {
                id: req.params.id,
                companyId
            }
        });

        if (!user) {
            return next(ApiError.notFound('User not found'));
        }

        // Do not allow changing role to superadmin
        if (role === 'superadmin') {
            return next(ApiError.forbidden('Cannot assign superadmin role'));
        }

        // Check if email already exists in the company
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({
                where: { email, companyId }
            });
            if (existingEmail) {
                return next(ApiError.conflict('Email already in use in this company', {
                    field: 'email',
                    value: email
                }));
            }
        }

        await user.update({
            name,
            email,
            role,
            active
        });

        return res.json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete user
export const deleteUser = async (req, res, next) => {
    try {
        const companyId = req.user.companyId;
        const user = await User.findOne({
            where: {
                id: req.params.id,
                companyId
            }
        });

        if (!user) {
            return next(ApiError.notFound('User not found'));
        }

        // Do not allow deleting the company admin
        if (user.isCompanyAdmin) {
            return next(ApiError.forbidden('Cannot delete the company admin'));
        }

        await user.destroy();
        return res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// User login
export const login = async (req, res, next) => {
    try {
        // Validar datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log('[Login] Iniciando proceso de login');
        const { email, password } = req.body;
        console.log('[Login] Email recibido:', email);

        // Find user
        const user = await User.findOne({
            where: { email },
            include: ['Company']
        });

        console.log('[Login] Usuario encontrado:', user ? 'Sí' : 'No');

        if (!user) {
            console.log('[Login] Usuario no encontrado');
            return next(ApiError.notFound('User not found'));
        }

        // Verify password
        const validPassword = await user.checkPassword(password);
        console.log('[Login] Contraseña válida:', validPassword ? 'Sí' : 'No');

        if (!validPassword) {
            console.log('[Login] Contraseña incorrecta');
            return next(ApiError.unauthorized('Incorrect password'));
        }

        // Generate token with company information
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                isCompanyAdmin: user.isCompanyAdmin,
                companyName: user.Company?.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('[Login] Token generado exitosamente');

        return res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                companyName: user.Company?.name
            },
            token
        });
    } catch (error) {
        console.error('[Login] Error en el proceso de login:', error);
        next(error);
    }
};

// Forgot password (solo respuesta, sin correo)
export const forgotPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Simula búsqueda de usuario
        // const user = await User.findOne({ where: { email: req.body.email } });
        // No importa si existe o no, siempre responde igual
        return res.json({ message: 'If the email exists, you will receive instructions to reset your password.' });
    } catch (error) {
        next(error);
    }
};

// Reset password (solo respuesta, sin correo)
export const resetPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Simula validación de token y cambio de contraseña
        // Aquí podrías buscar el token en una tabla temporal, etc.
        // Por ahora, solo responde éxito
        return res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        next(error);
    }
}; 