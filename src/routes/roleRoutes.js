import { Router } from 'express';
import { verifyToken, isSuperAdmin } from '../middleware/auth.js';
import { getRoles, getPermissions, assignPermissionToRole } from '../controllers/roleController.js';

const router = Router();

router.get('/roles', verifyToken, isSuperAdmin, getRoles);
router.get('/permissions', verifyToken, isSuperAdmin, getPermissions);
router.post('/roles/:roleId/permissions', verifyToken, isSuperAdmin, assignPermissionToRole);

export default router; 