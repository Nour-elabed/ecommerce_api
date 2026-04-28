// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

    console.error(`[ERROR] ${req.method} ${req.originalUrl} -`, err.message);

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandler;
