# Microservicio de Usuarios

Este microservicio forma parte del sistema de ventas y se encarga de la gestión de usuarios, autenticación y autorización.

> Línea de prueba para forzar ejecución del pipeline CI/CD.

## Estado del CI/CD
![CI/CD Status](https://github.com/esanteliz88/apiUserDocker/actions/workflows/ci-cd.yml/badge.svg)

## Flujo de Trabajo CI/CD

### ¿Qué es CI/CD?

- **CI (Integración Continua)**:  
  Integramos cambios de código frecuentemente a un repositorio compartido. Cada vez que subimos código, se ejecutan pruebas automáticas para asegurarnos de que todo sigue funcionando.

- **CD (Entrega/Despliegue Continua)**:  
  Automatizamos el proceso de despliegue. Si las pruebas pasan, el sistema construye y despliega automáticamente la aplicación (por ejemplo, subiendo una imagen Docker a la nube).

### ¿Por qué es importante?

- Detectamos errores rápidamente (antes de que lleguen a producción).
- Todo el equipo trabaja sobre una base estable.
- El despliegue es más seguro y rápido.
- Podemos entregar nuevas versiones a los usuarios de forma ágil.

### ¿Cómo funciona en este proyecto?

1. **Subimos código a GitHub** (`git push`).
2. **GitHub Actions** detecta el cambio y ejecuta el workflow:
   - Instala dependencias.
   - Corre pruebas automáticas.
   - Analiza seguridad.
   - Si todo está bien, construye y sube la imagen Docker (si tienes configurado AWS/ECR).
3. **Recibimos feedback**: Si algo falla, nos avisa en GitHub. Si todo pasa, el microservicio está listo para producción.

### ¿Qué necesitamos para aprovecharlo?

- Tener nuestros tests bien escritos.
- Mantener actualizado el workflow (`.github/workflows/ci-cd.yml`).
- Configurar los secrets (tokens y claves) en GitHub.
- Hacer commits y push frecuentemente.

## Instalación y Uso

1. Clona el repositorio:
   ```bash
   git clone https://github.com/esanteliz88/apiUserDocker.git
   cd apiUserDocker
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tus configuraciones
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

## Contribución

1. Haz un fork del repositorio.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Haz commit de tus cambios (`git commit -m 'Agrega nueva funcionalidad'`).
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT.    Prueba de CI/CD: activando workflow.