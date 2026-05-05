const EventUserRole = require('../models/relations/eventUserRoleModel');

/* ==================================================
   REQUIRE EVENT ROLE MIDDLEWARE

   Handles:
   - event role-based access control
   - organizer / co-organizer / participant permissions
   - authenticated user's membership lookup

   Notes:
   - used as a middleware factory
   - allowedRoles is provided by the route
   - attaches membership to req.eventMembership
================================================== */

// Require authenticated user to have one of the allowed event roles
const requireEventRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const eventId = req.params.eventId;
            const userId = req.user.userId;

            if (eventId == null) {
                return res.status(400).json({
                    message: 'Event ID is required'
                });
            }

            // Find the authenticated user's membership for this event
            const membership = await EventUserRole.findOne({
                where: { eventId, userId }
            });

            // Block users who are not members or do not have enough permissions
            if (!membership || !allowedRoles.includes(membership.role)) {
                return res.status(403).json({
                    message: 'Forbidden: insufficient event role'
                });
            }

            // Reuse membership in downstream handlers if needed
            req.eventMembership = membership;
            next();

        } catch (error) {
            console.error('Error checking role permission:', error);

            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    };
};

module.exports = { requireEventRole };
