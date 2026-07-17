const eventMembershipService = require("../services/eventMembershipService");

/* ==========================================================================
   Event Membership Controller

   Handles event membership responses.

   Responsibilities
   - Join and leave events
   - Retrieve event members and staff
   - Update member roles
   - Remove members
   - Transfer event ownership
   - Return API responses

   Notes
   - Business logic is delegated to eventMembershipService.
   - Authorization is handled by route middlewares.
   - Current user event listings belong to userController.
=========================================================================== */

/* =============================
   MEMBERSHIP ACTIONS
============================= */

// Join an event as the authenticated user
const joinEvent = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        const membership = await eventMembershipService.joinEvent({
            eventId,
            userId
        });

        return res.status(200).json({
            success: true,
            message: "User successfully joined the event",
            membership
        });

    } catch (error) {
        return next(error);
    }
};

// Leave an event as the authenticated user
const leaveEvent = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        await eventMembershipService.leaveEvent({
            eventId,
            userId
        });

        return res.status(200).json({
            success: true,
            message: "User successfully left the event"
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   MEMBER RETRIEVAL
============================= */

// Retrieve active event members
const getEventMembers = async (req, res, next) => {
    try {
        const members = await eventMembershipService.getEventMembers(
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event members retrieved successfully",
            members
        });

    } catch (error) {
        return next(error);
    }
};

// Retrieve active event organizers and co-organizer
const getEventStaff = async (req, res, next) => {
    try {
        const eventStaff = await eventMembershipService.getEventStaff(
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event staff retrieved successfully",
            eventStaff
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   MEMBER MANAGEMENT
============================= */

// Update an event member's role
const updateEventMemberRole = async (req, res, next) => {
    try {
        const membership = await eventMembershipService.updateEventMemberRole({
            eventId: req.params.eventId,
            userId: req.params.userId,
            newRole: req.body.newRole
        });

        return res.status(200).json({
            success: true,
            message: "Event member role updated successfully",
            membership
        });

    } catch (error) {
        return next(error);
    }
};

// Remove a member from an event
const removeEventMember = async (req, res, next) => {
    try {
        await eventMembershipService.removeEventMember({
            eventId: req.params.eventId,
            userId: req.params.userId
        });

        return res.status(200).json({
            success: true,
            message: "Event member removed successfully"
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   OWNERSHIP TRANSFER
============================= */

// Transfer event ownership to another member
const transferEventOwnership = async (req, res, next) => {
    try {
        const result = await eventMembershipService.transferEventOwnership({
            eventId: req.params.eventId,
            currentUserId: req.user.userId,
            targetUserId: req.body.targetUserId
        });

        return res.status(200).json({
            success: true,
            message: "Event ownership transferred successfully",
            data: result
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = {
    joinEvent,
    leaveEvent,
    getEventMembers,
    getEventStaff,
    updateEventMemberRole,
    removeEventMember,
    transferEventOwnership
};
