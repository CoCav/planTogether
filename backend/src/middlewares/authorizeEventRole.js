const EventUserRole = require("../models/relations/eventUserRoleModel");

/* ==================================================
   AUTHORIZE EVENT ROLE MIDDLEWARE

   Handles:
   - event role-based access control
   - organizer / co-organizer / participant permissions
   - authenticated user's event membership lookup

   Notes:
   - used as a middleware factory
   - allowedRoles is defined per route
   - attaches membership to req.eventMembership
================================================== */

// Authorize authenticated user based on event role
const authorizeEventRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const eventId = req.params.eventId;
            const userId = req.user.userId;

            if (eventId == null) {
                return res.status(400).json({
                    success: false,
                    message: "Event ID is required"
                });
            }

            // Find authenticated user's membership for this event
            const membership = await EventUserRole.findOne({
                where: { eventId, userId }
            });

            // Block users without required event role
            if (!membership || !allowedRoles.includes(membership.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: insufficient event role"
                });
            }

            // Reuse membership in downstream handlers if needed
            req.eventMembership = membership;

            return next();

        } catch (error) {
            console.error("Error authorizing event role:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
};

module.exports = authorizeEventRole;
