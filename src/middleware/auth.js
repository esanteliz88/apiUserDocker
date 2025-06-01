import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'No token provided',
                success: false
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(401).json({
                    message: 'User not found',
                    success: false
                });
            }

            if (!user.active) {
                return res.status(401).json({
                    message: 'User is inactive',
                    success: false
                });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            return res.status(401).json({
                message: 'Invalid or expired token',
                success: false,
                error: jwtError.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Error verifying token',
            success: false,
            error: error.message
        });
    }
};

export const isSuperAdmin = (req, res, next) => {
    try {
        if (req.user.role !== 'superadmin') {
            throw ApiError.forbidden('Access denied. Superadmin role required');
        }
        next();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.internal('Error checking superadmin role', error.message);
    }
};

export const isCompanyAdmin = (req, res, next) => {
    try {
        if (!req.user.isCompanyAdmin) {
            throw ApiError.forbidden('Access denied. Company admin role required');
        }
        next();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.internal('Error checking company admin role', error.message);
    }
};

export const isAdmin = (req, res, next) => {
    try {
        if (req.user.role !== 'admin' && !req.user.isCompanyAdmin) {
            throw ApiError.forbidden('Access denied. Admin role required');
        }
        next();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.internal('Error checking admin role', error.message);
    }
};

export const isSameCompany = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const targetUser = await User.findByPk(targetUserId);

        if (!targetUser) {
            throw ApiError.notFound('User not found');
        }

        if (targetUser.companyId !== req.user.companyId) {
            throw ApiError.forbidden('Access denied. User belongs to a different company');
        }

        next();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.internal('Error checking company access', error.message);
    }
};

// Middleware para verificar que el usuario pertenece a la empresa
export const belongsToCompany = (req, res, next) => {
    const companyId = req.params.id || req.params.companyId || req.body.companyId;
    if (!companyId) {
        return res.status(400).json({ message: 'Company ID not provided' });
    }
    if (req.user.role === 'superadmin') return next();
    if (req.user.companyId !== companyId) {
        return res.status(403).json({ message: 'You do not have permission to access this company' });
    }
    next();
}; 