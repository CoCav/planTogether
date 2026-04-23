const EventUserRole = require('../models/relations/eventUserRoleModel');
const Event = require('../models/eventModel');

// Prevents unauthorized role changes
// Rule set (simple hierarchy):
// organizer > co_organizer > participant
const authorizeRoleChange = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const targetUserId = Number(req.params.userId);
    const { newRole } = req.body

    if (eventId == null || Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Valid eventId and userId are required' });
    }

    const [targetUserLink, currentEvent] = await Promise.all([
      EventUserRole.findOne({ where: { eventId, userId: targetUserId } }),
      Event.findByPk(eventId),
    ]);

    if (!currentEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!targetUserLink) {
      return res.status(404).json({ message: 'User link not found in event' });
    }

    // Protects the event creator
    if (targetUserId === currentEvent.creatorId) {
      return res.status(403).json({ message: 'You cannot change the role of the event creator' });
    }

    // Prevents changing the organizer role
    if (targetUserLink.role === 'organizer') {
      return res.status(403).json({ message: 'Organizer role cannot be changed' });
    }

    // // Prevents promoting someone to organizer
    if (newRole === 'organizer' ) {
      return res.status(403).json({ message: 'Only one organizer is allowed per event' });
    }

    next();
  } catch (error) {
    console.error('Error authorizing role change:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Prevents unauthorized member removals
const authorizeMemberRemoval = async (req, res, next) => {
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

    // Prevent removing the event creator
    if (targetUserId === currentEvent.creatorId) {
      return res.status(403).json({ message: 'You cannot remove the event creator' });
    }

    // Prevent removing the organizer
    if (targetUserLink.role === 'organizer') {
      return res.status(403).json({ message: 'Organizer cannot be removed from the event' });
    }

    // Prevent self-removal through admin remove route
    if (targetUserId === requestingUserId) {
      return res.status(403).json({ message: 'You cannot remove yourself from the event' });
    }

    // Co-organizers can only remove participants
    if (requestingUserLink.role === 'co_organizer' && targetUserLink.role !== 'participant') {
      return res.status(403).json({ message: 'Co-organizers can only remove participants' });
    }

    next();
  } catch (error) {
    console.error('Error authorizing member removal:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { authorizeRoleChange, authorizeMemberRemoval };