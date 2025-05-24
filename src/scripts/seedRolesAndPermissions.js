import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import { sequelize } from '../config/database.js';

const roles = [
    { name: 'superadmin' },
    { name: 'admin' },
    { name: 'user' }
];

const permissions = [
    { name: 'manage_users' },
    { name: 'manage_companies' },
    { name: 'view_reports' }
];

const rolePermissions = {
    superadmin: ['manage_users', 'manage_companies', 'view_reports'],
    admin: ['manage_users', 'view_reports'],
    user: []
};

async function seedRolesAndPermissions() {
    try {
        await sequelize.sync();

        // Crear roles
        const createdRoles = {};
        for (const role of roles) {
            const [r] = await Role.findOrCreate({ where: { name: role.name } });
            createdRoles[role.name] = r;
        }

        // Crear permisos
        const createdPermissions = {};
        for (const perm of permissions) {
            const [p] = await Permission.findOrCreate({ where: { name: perm.name } });
            createdPermissions[perm.name] = p;
        }

        // Asignar permisos a roles
        for (const [roleName, perms] of Object.entries(rolePermissions)) {
            const role = createdRoles[roleName];
            const permsToAdd = perms.map(p => createdPermissions[p]);
            await role.setPermissions(permsToAdd);
        }

        console.log('Roles y permisos iniciales creados correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error al crear roles y permisos:', error);
        process.exit(1);
    }
}

seedRolesAndPermissions(); 