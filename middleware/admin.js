import { ROLES } from "../constants/roles.js";

/**
 * Admin authorization middleware.
 * Must be used AFTER the `protect` middleware (req.user must be set).
 */
export const admin = (req, res, next) => {
    const userRole = req.user?.role || (req.user?.isAdmin ? ROLES.ADMIN : ROLES.USER);
    if (req.user && (userRole === ROLES.ADMIN || userRole === ROLES.SUPER_ADMIN)) {
        return next();
    }
    res.status(403).json({ success: false, message: "Access denied: Admins only" });
};
