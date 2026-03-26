/**
 * MIDDLEWARE PARA MANEJO CENTRALIZADO DE ERRORES
 */

// Manejo de rutas no encontradas (404)
const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Manejo de errores generales
const errorHandler = (err, req, res, next) => {
    // Si ya hay un código de estado, usarlo; sino, 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Mostrar stack solo en desarrollo
        stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
};

module.exports = { notFound, errorHandler };