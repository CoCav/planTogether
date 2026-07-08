const Event = require("../../models/eventModel");
const EventUserRole = require("../../models/associations/eventUserRoleModel");

const { EVENT_ROLES, STAFF_EVENT_ROLES } = require("../../constants/eventRoles");

const { createHttpError } = require("../../utils/errors/httpError");
const { findEventByIdOrFail } = require("../../utils/events/eventQueries");

const { findActiveMembership } = require("../../utils/eventMemberships/eventMembershipQueries");

/* ==========================================================================
   Event Member Authorization Middleware

   Authorizes event member role updates and removals.

   Responsibilities
   - Check organizer and co-organizer permissions
   - Protect the event creator from demotion or removal
   - Validate target memberships before member actions
   - Attach target membership to req.targetMembership

   Notes
   - Organizer can update participant and co-organizer roles.
   - Organizer and co-organizer can remove participants.
   - Event creator cannot be demoted or removed.
=========================================================================== */

const ONLY_ORGANIZER_CAN_UPDATE_ERROR = "Only the organizer can update member roles";
const TARGET_MEMBERSHIP_NOT_FOUND_ERROR = "Target membership not found";
const CANNOT_CHANGE_CREATOR_ROLE_ERROR = "You cannot change the role of the event creator";
const ONLY_ONE_ORGANIZER_ERROR = "Only one organizer is allowed per event";
const ONLY_MANAGERS_CAN_REMOVE_ERROR = "Only organizers and co-organizers can remove members";
const CANNOT_REMOVE_CREATOR_ERROR = "You cannot remove the event creator";
const CANNOT_REMOVE_SELF_ERROR = "You cannot remove yourself from the event";
const CANNOT_REMOVE_ORGANIZER_ERROR = "Organizer cannot be removed";
const CO_ORGANIZER_CANNOT_REMOVE_CO_ORGANIZER_ERROR = "Co-organizers cannot remove other co-organizers";

/* Helpers */

const isOrganizer = (membership) => {
    return membership?.role === EVENT_ROLES.ORGANIZER;
};

const canManageMemberRemoval = (membership) => {
    return STAFF_EVENT_ROLES.includes(membership?.role);
};

const isEventCreator = (event, membership) => {
    return event.creatorId === membership.userId;
};

const getActiveMembership = ({ eventId, userId }) => {
    return findActiveMembership(EventUserRole, {
        eventId,
        userId
    });
};

/* Role update authorization */

const authorizeEventMemberRoleUpdate = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const requestingUserId = req.user.userId;
        const targetUserId = Number(req.params.userId);
        const { newRole } = req.body;

        const requesterMembership = await getActiveMembership({
            eventId,
            userId: requestingUserId
        });

        if (!isOrganizer(requesterMembership)) {
            return next(createHttpError(403, ONLY_ORGANIZER_CAN_UPDATE_ERROR));
        }

        const targetMembership = await getActiveMembership({
            eventId,
            userId: targetUserId
        });

        if (!targetMembership) {
            return next(createHttpError(404, TARGET_MEMBERSHIP_NOT_FOUND_ERROR));
        }

        const event = await findEventByIdOrFail(Event, eventId);

        if (isEventCreator(event, targetMembership)) {
            return next(createHttpError(403, CANNOT_CHANGE_CREATOR_ROLE_ERROR));
        }

        if (newRole === EVENT_ROLES.ORGANIZER) {
            return next(createHttpError(403, ONLY_ONE_ORGANIZER_ERROR));
        }

        req.targetMembership = targetMembership;

        return next();

    } catch (error) {
        return next(error);
    }
};

/* Member removal authorization */

const authorizeEventMemberRemoval = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const requestingUserId = req.user.userId;
        const targetUserId = Number(req.params.userId);

        const requesterMembership = await getActiveMembership({
            eventId,
            userId: requestingUserId
        });

        if (!canManageMemberRemoval(requesterMembership)) {
            return next(createHttpError(403, ONLY_MANAGERS_CAN_REMOVE_ERROR));
        }

        const targetMembership = await getActiveMembership({
            eventId,
            userId: targetUserId
        });

        if (!targetMembership) {
            return next(createHttpError(404, TARGET_MEMBERSHIP_NOT_FOUND_ERROR));
        }

        const event = await findEventByIdOrFail(Event, eventId);

        if (isEventCreator(event, targetMembership)) {
            return next(createHttpError(403, CANNOT_REMOVE_CREATOR_ERROR));
        }

        if (requesterMembership.userId === targetMembership.userId) {
            return next(createHttpError(403, CANNOT_REMOVE_SELF_ERROR));
        }

        if (targetMembership.role === EVENT_ROLES.ORGANIZER) {
            return next(createHttpError(403, CANNOT_REMOVE_ORGANIZER_ERROR));
        }

        if (
            targetMembership.role === EVENT_ROLES.CO_ORGANIZER &&
            requesterMembership.role === EVENT_ROLES.CO_ORGANIZER
        ) {
            return next(createHttpError(
                403,
                CO_ORGANIZER_CANNOT_REMOVE_CO_ORGANIZER_ERROR
            ));
        }

        req.targetMembership = targetMembership;

        return next();

    } catch (error) {
        return next(error);
    }
};

module.exports = {
    authorizeEventMemberRoleUpdate,
    authorizeEventMemberRemoval
};
