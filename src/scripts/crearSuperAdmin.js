import User from '../models/User.js';
import { sequelize } from '../config/database.js';
// import bcrypt from 'bcryptjs'; // Ya no es necesario

const crearSuperAdmin = async () => {
    try {
        // Sincronizar la base de datos
        await sequelize.sync();

        // Eliminar superadmin existente
        await User.destroy({
            where: { role: 'superadmin' }
        });
        console.log('Superadmin anterior eliminado');

        // Crear el superadmin (contraseña en texto plano)
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@admin.com',
            password: 'admin123', // Contraseña en texto plano
            role: 'superadmin',
            isCompanyAdmin: true,
            active: true,
            companyId: null // El superadmin no pertenece a ninguna empresa
        });

        console.log('Superadmin creado exitosamente:', {
            id: admin.id,
            email: admin.email,
            role: admin.role,
            isCompanyAdmin: admin.isCompanyAdmin,
            active: admin.active
        });

        // Verificar que la contraseña funciona
        const passwordCheck = await admin.checkPassword('admin123');
        console.log('Verificación de contraseña:', passwordCheck);

        process.exit(0);
    } catch (error) {
        console.error('Error creando superadmin:', error);
        process.exit(1);
    }
};

crearSuperAdmin(); 