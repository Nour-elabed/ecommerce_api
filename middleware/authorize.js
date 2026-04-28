import { ROLES } from "../constants/roles.js";

export const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Access denied: insufficient permissions" });
    }
    return next();
};

export const isAdmin = authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN);
export const isSuperAdmin = authorize(ROLES.SUPER_ADMIN);
