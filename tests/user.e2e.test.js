import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

const api = request('http://localhost:3000');

let superadminToken = '';
let createdUserId = '';

// Utilidad para login de superadmin
async function loginSuperadmin() {
    const res = await api.post('/api/users/login').send({
        email: 'admin@admin.com',
        password: 'admin123'
    });
    return res.body.token || res.body.data?.token;
}

describe('User Microservice E2E', () => {
    beforeAll(async () => {
        superadminToken = await loginSuperadmin();
    });

    it('Login superadmin debe funcionar', async () => {
        const res = await api.post('/api/users/login').send({
            email: 'admin@admin.com',
            password: 'admin123'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.token || res.body.data?.token).toBeDefined();
    });

    it('Forgot password responde correctamente', async () => {
        const res = await api.post('/api/users/forgot-password').send({ email: 'admin@admin.com' });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/If the email exists/i);
    });

    it('Reset password responde correctamente', async () => {
        const res = await api.post('/api/users/reset-password').send({ token: 'fake-token', newPassword: 'newpass123' });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Password has been reset/i);
    });

    it('Registro de usuario requiere autenticación', async () => {
        const res = await api.post('/api/users/register').send({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'testpass123',
            role: 'user'
        });
        expect(res.statusCode).toBe(401);
    });

    it('Listado de roles requiere superadmin', async () => {
        const res = await api.get('/api/roles/roles').set('Authorization', `Bearer ${superadminToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.roles)).toBe(true);
    });

    it('Listado de permisos requiere superadmin', async () => {
        const res = await api.get('/api/roles/permissions').set('Authorization', `Bearer ${superadminToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.permissions)).toBe(true);
    });

    it('Asignar permisos a un rol requiere superadmin', async () => {
        // Obtener roles y permisos
        const rolesRes = await api.get('/api/roles/roles').set('Authorization', `Bearer ${superadminToken}`);
        const permsRes = await api.get('/api/roles/permissions').set('Authorization', `Bearer ${superadminToken}`);
        const roleId = rolesRes.body.roles[0]?.id;
        const permissionIds = permsRes.body.permissions.map(p => p.id);
        if (roleId && permissionIds.length) {
            const res = await api.post(`/api/roles/roles/${roleId}/permissions`)
                .set('Authorization', `Bearer ${superadminToken}`)
                .send({ permissionIds });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/Permissions assigned/i);
        }
    });
}); 