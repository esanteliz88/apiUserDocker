import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import { ApiError } from '../utils/ApiError.js';

export const getRoles = async (req, res, next) => {
    try {
        const roles = await Role.findAll({ include: Permission });
        return res.json({ roles });
    } catch (error) {
        next(error);
    }
};

export const getPermissions = async (req, res, next) => {
    try {
        const permissions = await Permission.findAll();
        return res.json({ permissions });
    } catch (error) {
        next(error);
    }
};

export const assignPermissionToRole = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const { permissionIds } = req.body; // array de IDs

        const role = await Role.findByPk(roleId);
        if (!role) return next(ApiError.notFound('Role not found'));

        const permissions = await Permission.findAll({ where: { id: permissionIds } });
        await role.setPermissions(permissions);

        return res.json({ message: 'Permissions assigned to role successfully' });
    } catch (error) {
        next(error);
    }
}; 