/**
 * Middleware para manejar errores de manera estandarizada
 */
export const errorHandler = (err, req, res, next) => {
    console.log('[ErrorHandler] Error recibido:', err);
    console.log('[ErrorHandler] Tipo de error:', err.constructor.name);
    console.log('[ErrorHandler] Mensaje:', err.message);
    console.log('[ErrorHandler] Stack:', err.stack);

    // Determinar el código de estado
    const statusCode = err.statusCode || 500;

    // Crear objeto de error estandarizado
    const error = {
        status: statusCode,
        success: false,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
        message: err.message || 'Error interno del servidor',
        details: err.details || null,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    // Log del error
    console.error(`[ErrorHandler] ${req.method} ${req.originalUrl}`, {
        error: err.message,
        stack: err.stack,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user
    });

    // Enviar respuesta
    console.log('[ErrorHandler] Enviando respuesta de error:', error);
    res.status(statusCode).json(error);
}; 