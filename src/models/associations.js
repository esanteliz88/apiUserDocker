import Role from './Role.js';
import Permission from './Permission.js';

Role.belongsToMany(Permission, { through: 'RolePermission' });
Permission.belongsToMany(Role, { through: 'RolePermission' }); 