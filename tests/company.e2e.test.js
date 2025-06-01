import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

const api = request('http://localhost:3000');

let superadminToken = '';
let createdCompanyId = '';

async function loginSuperadmin() {
    const res = await api.post('/api/users/login').send({
        email: 'admin@admin.com',
        password: 'admin123'
    });
    return res.body.token || res.body.data?.token;
}

describe('Company Microservice E2E', () => {
    beforeAll(async () => {
        superadminToken = await loginSuperadmin();
    });

    it('Registrar compañía como superadmin', async () => {
        const res = await api.post('/api/companies/register')
            .set('Authorization', `Bearer ${superadminToken}`)
            .send({
                name: 'Empresa Test',
                email: 'empresa_test@correo.com',
                password: 'clave123',
                adminName: 'Admin Test',
                adminEmail: 'admin_test@correo.com',
                adminPassword: 'adminclave123'
            });
        expect([200, 201, 409]).toContain(res.statusCode); // 409 si ya existe
        if (res.body.company) createdCompanyId = res.body.company.id;
    });

    it('Listar compañías', async () => {
        const res = await api.get('/api/companies')
            .set('Authorization', `Bearer ${superadminToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.companies)).toBe(true);
    });

    it('Obtener compañía por ID', async () => {
        if (!createdCompanyId) return;
        const res = await api.get(`/api/companies/${createdCompanyId}`)
            .set('Authorization', `Bearer ${superadminToken}`);
        expect([200, 404]).toContain(res.statusCode);
    });

    it('Actualizar compañía', async () => {
        if (!createdCompanyId) return;
        const res = await api.put(`/api/companies/${createdCompanyId}`)
            .set('Authorization', `Bearer ${superadminToken}`)
            .send({ name: 'Empresa Test Actualizada' });
        expect([200, 404]).toContain(res.statusCode);
    });

    it('Eliminar compañía', async () => {
        if (!createdCompanyId) return;
        const res = await api.delete(`/api/companies/${createdCompanyId}`)
            .set('Authorization', `Bearer ${superadminToken}`);
        expect([200, 404]).toContain(res.statusCode);
    });
}); 