import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Role from './Role.js';
import Permission from './Permission.js';

const RolePermission = sequelize.define('RolePermission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });

export default RolePermission; 