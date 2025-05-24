/**
 * Clase personalizada para errores de la API
 */
export class ApiError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message, details = null) {
        return new ApiError(message, 400, details);
    }

    static unauthorized(message = 'No autorizado', details = null) {
        return new ApiError(message, 401, details);
    }

    static forbidden(message = 'Acceso denegado', details = null) {
        return new ApiError(message, 403, details);
    }

    static notFound(message = 'Recurso no encontrado', details = null) {
        return new ApiError(message, 404, details);
    }

    static conflict(message, details = null) {
        return new ApiError(message, 409, details);
    }

    static internal(message = 'Error interno del servidor', details = null) {
        return new ApiError(message, 500, details);
    }
} 