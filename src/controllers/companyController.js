import Company from '../models/Company.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

// Register a new company
export const registerCompany = async (req, res, next) => {
    try {
        const { name, email, password, adminName, adminEmail, adminPassword } = req.body;

        // Check if company already exists
        const existingCompany = await Company.findOne({
            where: { email }
        });

        if (existingCompany) {
            return next(ApiError.conflict('Company already exists', {
                field: 'email',
                value: email
            }));
        }

        // Create the company
        const company = await Company.create({
            name,
            email,
            password
        });

        // Create the company admin
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            companyId: company.id,
            isCompanyAdmin: true
        });

        res.data = {
            message: 'Company created successfully',
            company: {
                id: company.id,
                name: company.name,
                email: company.email
            },
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        };
        return next();
    } catch (error) {
        next(error);
    }
};

// Get all companies
export const getCompanies = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: companies } = await Company.findAndCountAll({
            attributes: ['id', 'name', 'email', 'active', 'createdAt'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.data = {
            companies,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        };
        return next();
    } catch (error) {
        next(error);
    }
};

// Get company by ID
export const getCompany = async (req, res, next) => {
    try {
        const company = await Company.findOne({
            where: { id: req.params.id },
            attributes: ['id', 'name', 'email', 'active', 'createdAt']
        });

        if (!company) {
            return next(ApiError.notFound('Company not found'));
        }

        res.data = { company };
        return next();
    } catch (error) {
        next(error);
    }
};

// Update company
export const updateCompany = async (req, res, next) => {
    try {
        const { name, email, active } = req.body;

        const company = await Company.findOne({
            where: { id: req.params.id }
        });

        if (!company) {
            return next(ApiError.notFound('Company not found'));
        }

        // Check if email already exists
        if (email && email !== company.email) {
            const existingEmail = await Company.findOne({
                where: { email }
            });
            if (existingEmail) {
                return next(ApiError.conflict('Email already in use', {
                    field: 'email',
                    value: email
                }));
            }
        }

        await company.update({
            name,
            email,
            active
        });

        res.data = {
            message: 'Company updated successfully',
            company: {
                id: company.id,
                name: company.name,
                email: company.email,
                active: company.active
            }
        };
        return next();
    } catch (error) {
        next(error);
    }
};

// Delete company
export const deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findOne({
            where: { id: req.params.id }
        });

        if (!company) {
            return next(ApiError.notFound('Company not found'));
        }

        await company.destroy();
        res.data = { message: 'Company deleted successfully' };
        return next();
    } catch (error) {
        next(error);
    }
}; 