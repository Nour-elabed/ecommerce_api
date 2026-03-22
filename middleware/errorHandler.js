/**
 * Global Express error handler.
 * Catches anything thrown/passed to next(err) in any route.
 * Always returns a standardized { success, message } JSON response.
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200
        ? res.statusCode
        : 500;

    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandler;
