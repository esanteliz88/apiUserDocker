import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const Company = sequelize.define('Company', {
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
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    hooks: {
        beforeCreate: async (company) => {
            if (company.password) {
                const salt = await bcrypt.genSalt(10);
                company.password = await bcrypt.hash(company.password, salt);
            }
        },
        beforeUpdate: async (company) => {
            if (company.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                company.password = await bcrypt.hash(company.password, salt);
            }
        }
    }
});

// Instance method to check password
Company.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default Company; 