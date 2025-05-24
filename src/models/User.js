import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';
import Company from './Company.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('superadmin', 'admin', 'user'),
        defaultValue: 'user'
    },
    isCompanyAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Companies',
            key: 'id'
        }
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to check password
User.prototype.checkPassword = async function (password) {
    try {
        console.log('Comparando contraseñas:');
        console.log('Contraseña proporcionada:', password);
        console.log('Hash almacenado:', this.password);
        const result = await bcrypt.compare(password, this.password);
        console.log('Resultado de la comparación:', result);
        return result;
    } catch (error) {
        console.error('Error al verificar contraseña:', error);
        return false;
    }
};

// Define associations
User.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });
Company.hasMany(User, { foreignKey: 'companyId' });

export default User; 