const EventUserRole = require('../models/Link/eventUserRoleModel');
const Event = require('../models/eventModel');

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

// Prevents unauthorized role changes
// Rule set (simple hierarchy):
// organizer > co_organizer > participant
const authorizeRoleChange = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const targetUserId = Number(req.params.userId);
    const requestingUserId = req.user.userId;

    if (eventId == null || Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Valid eventId and userId are required' });
    }

    const [requestingUserLink, targetUserLink, currentEvent] = await Promise.all([
      EventUserRole.findOne({ where: { eventId, userId: requestingUserId } }),
      EventUserRole.findOne({ where: { eventId, userId: targetUserId } }),
      Event.findByPk(eventId),
    ]);

    if (!currentEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!requestingUserLink || !targetUserLink) {
      return res.status(404).json({ message: 'User link not found in event' });
    }

    // Protect the event creator from role changes (if that's your rule)
    if (targetUserId === currentEvent.creatorId) {
      return res.status(403).json({ message: 'You cannot change the role of the event creator' });
    }

    // Only organizer can modify the organizer role
    if (targetUserLink.role === 'organizer' && requestingUserLink.role !== 'organizer') {
      return res.status(403).json({ message: 'Only the organizer can change the organizer role' });
    }

    // Co_organizer can only manage participants (not other co_organizers)
    if (requestingUserLink.role === 'co_organizer' && targetUserLink.role !== 'participant') {
      return res.status(403).json({ message: 'Co_organizers can only manage participants' });
    }

    next();
  } catch (error) {
    console.error('Error authorizing role change:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { requireEventRole, authorizeRoleChange };