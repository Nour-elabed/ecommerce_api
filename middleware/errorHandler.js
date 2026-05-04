// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Check err.statusCode, err.status (Express/body-parser), then res.statusCode
    const statusCode =
        err.statusCode ||
        err.status ||
        (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode}:`, err.message);
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
    }

    // Prevent sending headers if already sent
    if (res.headersSent) {
        return next(err);
    }

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandler;
