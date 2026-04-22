import { ROLES } from "../constants/roles.js";

/**
 * Role guard middleware factory.
 * Usage: router.get("/path", protect, authorize(ROLES.ADMIN), handler)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Access denied: insufficient permissions",
        });
    }

    return next();
};

export { authorize, ROLES };
