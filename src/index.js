import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import './models/RolePermission.js';
import './models/associations.js';

// Environment variables configuration
dotenv.config();

const app = express();

// Middleware
app.use(helmet());

// CORS seguro (ajusta el origin según tu frontend)
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:3001'], // agrega aquí los orígenes permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Rate limiting global (100 requests por 15 minutos por IP)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});
app.use(globalLimiter);

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.originalUrl}`);
    console.log('[Server] Headers:', req.headers);
    console.log('[Server] Body:', req.body);
    next();
});

// Rutas
console.log('[Server] Montando rutas de usuarios en /api/users');
app.use('/api/users', userRoutes);

console.log('[Server] Montando rutas de empresas en /api/companies');
app.use('/api/companies', companyRoutes);

console.log('[Server] Montando rutas de roles en /api/roles');
app.use('/api/roles', roleRoutes);

// Configuración Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Usuarios - Sistema de Ventas',
            version: '1.0.0',
            description: 'Documentación de la API de usuarios para el sistema de ventas.'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Desarrollo local' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    security: [
        { bearerAuth: [] }
    ],
    apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test route
app.get('/', (req, res) => {
    console.log('[Server] Petición recibida en ruta de prueba');
    res.json({ message: 'User Microservice is running' });
});

// Middleware de errores (al final)
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('Rutas disponibles:');
            console.log('- GET /');
            console.log('- POST /api/users/login');
            console.log('- POST /api/users/register');
            console.log('- GET /api/users');
            console.log('- GET /api/users/:id');
            console.log('- PUT /api/users/:id');
            console.log('- DELETE /api/users/:id');
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer(); 