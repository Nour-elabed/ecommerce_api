import { ROLES } from "../constants/roles.js";

/**
 * Admin authorization middleware.
 * Must be used AFTER the `protect` middleware (req.user must be set).
 */
export const admin = (req, res, next) => {
    if (req.user && req.user.role === ROLES.ADMIN) {
        return next();
    }
    res.status(403).json({ success: false, message: "Access denied: Admins only" });
};
