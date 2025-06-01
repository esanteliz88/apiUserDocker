import { Router } from 'express';
import { verifyToken, isSuperAdmin } from '../middleware/auth.js';
import { getRoles, getPermissions, assignPermissionToRole } from '../controllers/roleController.js';
import { body, param } from 'express-validator';

const router = Router();

router.get('/roles', verifyToken, isSuperAdmin, getRoles);
router.get('/permissions', verifyToken, isSuperAdmin, getPermissions);
router.post('/roles/:roleId/permissions',
    verifyToken,
    isSuperAdmin,
    [
        param('roleId').isUUID().withMessage('Role ID must be a UUID'),
        body('permissionIds').isArray({ min: 1 }).withMessage('permissionIds must be a non-empty array'),
        body('permissionIds.*').isUUID().withMessage('Each permissionId must be a UUID')
    ],
    assignPermissionToRole
);

export default router; 