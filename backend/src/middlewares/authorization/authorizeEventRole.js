const EventUserRole = require("../../models/relations/eventUserRoleModel");

const { createHttpError } = require("../../utils/errors/httpError");

/* ==========================================================================
   Authorize Event Role Middleware

   Authorizes authenticated users based on their event membership role.

   Responsibilities
   - Check the authenticated user's active event membership
   - Validate allowed roles for the current route
   - Attach the membership to req.eventMembership

   Notes
   - Used as a middleware factory.
   - allowedRoles is defined per route.
   - Returns 403 when no matching allowed membership is found.
=========================================================================== */

const EVENT_ID_REQUIRED_ERROR = "Event ID is required";
const INSUFFICIENT_EVENT_ROLE_ERROR = "Forbidden: insufficient event role";

const authorizeEventRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const eventId = req.params.eventId;
            const userId = req.user.userId;

            if (eventId == null) {
                return next(createHttpError(400, EVENT_ID_REQUIRED_ERROR));
            }

            const membership = await EventUserRole.findOne({
                where: {
                    eventId,
                    userId,
                    deletedAt: null
                }
            });

            if (!membership || !allowedRoles.includes(membership.role)) {
                return next(createHttpError(403, INSUFFICIENT_EVENT_ROLE_ERROR));
            }

            // Reuse membership in downstream handlers.
            req.eventMembership = membership;

            return next();

        } catch (error) {
            return next(error);
        }
    };
};

module.exports = authorizeEventRole;
