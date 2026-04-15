const EventUserRole = require('../models/Link/eventUserRoleModel');

// Ensures the authenticated user has one of the allowed roles for the given event
const requireEventRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const eventId = req.params.eventId;
      const userId = req.user.userId;

      if (eventId == null) {
        return res.status(400).json({ message: 'Event ID is required' });
      }

      const membership = await EventUserRole.findOne({
        where: { eventId, userId },
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient event role' });
      }

      // Attach membership to request for downstream handlers
      req.eventMembership = membership;
      next();
    } catch (error) {
      console.error('Error checking role permission:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = { requireEventRole };