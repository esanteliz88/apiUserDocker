/**
 * Middleware mejorado para estandarizar solo respuestas exitosas
 */
export const responseHandler = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        // Si la respuesta ya fue enviada, no hacer nada
        if (res.headersSent) return;
        // Si es un error (status >= 400), no formatear
        if (res.statusCode >= 400) return originalJson.call(this, data);

        // Estructura estándar solo para respuestas exitosas
        const response = {
            status: res.statusCode,
            success: true,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
            data
        };
        return originalJson.call(this, response);
    };
    next();
}; 