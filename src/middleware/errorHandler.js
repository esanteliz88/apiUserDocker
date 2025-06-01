/**
 * Middleware para manejar errores de manera estandarizada
 */
export const errorHandler = (err, req, res, next) => {
    console.log('[ErrorHandler] Error recibido:', err);
    console.log('[ErrorHandler] Tipo de error:', err.constructor.name);
    console.log('[ErrorHandler] Mensaje:', err.message);
    // No mostrar stack en producción
    if (process.env.NODE_ENV === 'development') {
        console.log('[ErrorHandler] Stack:', err.stack);
    }

    // Determinar el código de estado
    const statusCode = err.statusCode || 500;

    // Manejar errores de validación de express-validator
    let details = err.details || null;
    if (Array.isArray(err.errors) && err.errors[0]?.msg) {
        details = err.errors.map(e => ({ field: e.param, message: e.msg }));
    }

    // Crear objeto de error estandarizado
    const error = {
        status: statusCode,
        success: false,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
        message: err.message || 'Error interno del servidor',
        details,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    // Log del error
    console.error(`[ErrorHandler] ${req.method} ${req.originalUrl}`, {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user
    });

    // Enviar respuesta
    res.status(statusCode).json(error);
}; 