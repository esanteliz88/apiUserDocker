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

const router = Router();

// Company registration (only superadmin)
router.post('/register', verifyToken, isSuperAdmin, registerCompany);

// Get all companies (only superadmin)
router.get('/', verifyToken, isSuperAdmin, getCompanies);

// Get company by ID (superadmin or company admin)
router.get('/:id', verifyToken, belongsToCompany, getCompany);

// Update company (superadmin or company admin)
router.put('/:id', verifyToken, belongsToCompany, updateCompany);

// Delete company (only superadmin)
router.delete('/:id', verifyToken, isSuperAdmin, deleteCompany);

export default router; 