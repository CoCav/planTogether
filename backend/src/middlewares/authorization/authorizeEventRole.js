const EventUserRole = require("../../models/relations/eventUserRoleModel");
const { createHttpError } = require("../../utils/errors/httpError");

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
   - returns 403 when no matching membership is found
   - nonexistent events may be rejected before reaching the service layer
================================================== */

// Authorize authenticated user based on event role
const authorizeEventRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const eventId = req.params.eventId;
            const userId = req.user.userId;

            if (eventId == null) {
                return next(createHttpError(400, "Event ID is required"));
            }

            // Find authenticated user's active membership for this event
            const membership = await EventUserRole.findOne({
                where: {
                    eventId,
                    userId,
                    deletedAt: null
                }
            });

            // Block users without required event role
            // Also covers nonexistent events when no membership exists for eventId
            if (!membership || !allowedRoles.includes(membership.role)) {
                return next(createHttpError(403, "Forbidden: insufficient event role"));
            }

            // Reuse membership in downstream handlers if needed
            req.eventMembership = membership;

            return next();

        } catch (error) {
            return next(error);
        }
    };
};

module.exports = authorizeEventRole;
