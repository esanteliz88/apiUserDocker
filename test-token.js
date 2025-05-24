import fetch from 'node-fetch';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc1ZGI1ZjAxLTRmOGItNDIyOC1hODU3LTc0MjBlODc2ZGFmOCIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwicm9sZSI6InN1cGVyYWRtaW4iLCJjb21wYW55SWQiOm51bGwsImlzQ29tcGFueUFkbWluIjp0cnVlLCJpYXQiOjE3NDgwOTg5MjcsImV4cCI6MTc0ODE4NTMyN30.SFi47QGyFkZCbvfBazspTJ2wkYDnMbESRW7soka2QSA';

async function verifyToken() {
    try {
        console.log('Enviando petición al servidor...');
        const response = await fetch('http://localhost:3000/api/users/verify-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Código de estado:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error('Error en la respuesta:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            return;
        }

        console.log('Respuesta del servidor:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error en la petición:', {
            message: error.message,
            stack: error.stack
        });
    } finally {
        console.log('Verificación completada');
    }
}

// Probar con un token válido
console.log('\nProbando con token válido:');
verifyToken();

// Probar con un token inválido
console.log('\nProbando con token inválido:');
const invalidToken = 'token.invalido.123';
async function testInvalidToken() {
    try {
        console.log('Enviando petición al servidor con token inválido...');
        const response = await fetch('http://localhost:3000/api/users/verify-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${invalidToken}`
            }
        });

        console.log('Código de estado:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error('Error en la respuesta:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            return;
        }

        console.log('Respuesta del servidor:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error en la petición:', {
            message: error.message,
            stack: error.stack
        });
    } finally {
        console.log('Verificación completada');
    }
}

testInvalidToken(); 