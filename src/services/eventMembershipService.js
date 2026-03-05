const { Op } = require('sequelize');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const EventUserRole = require('../models/Link/eventUserRoleModel');

const VALID_ROLES = ['organizer', 'co_organizer', 'participant'];

// User joins an event
const joinEvent = async ({ eventId, userId }) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user already joined the event
        const existingMembership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (existingMembership) {
            const error = new Error('User already joined this event');
            error.statusCode = 409;
            throw error;
        }

        // Add user to event as participant
        const membership = await EventUserRole.create({
            eventId,
            userId,
            role: 'participant'
        });

        return membership;

    } catch (error) {
        console.error('Error in joinEvent service:', error);
        throw error;
    }
};

// User leaves an event
const leaveEvent = async ({ eventId, userId }) => {
    try {

        // Check if membership exists
        const membership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (!membership) {
            const error = new Error('Participation not found');
            error.statusCode = 404;
            throw error;
        }

        // Remove membership
        await membership.destroy();
        return;

    } catch (error) {
        console.error('Error in leaveEvent service:', error);
        throw error;
    }
};

// Get all events for the current user
const listMyEvents = async (userId) => {
    try {

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Get events via memberships
        const memberships = await EventUserRole.findAll({
            where: { userId },
            include: [{
                model: Event,
                attributes: [
                    'id',
                    'title',
                    'description',
                    'date',
                    'location',
                    'type',
                    'theme',
                    'creatorId'
                ]
            }],
            order: [['createdAt', 'DESC']]
        });

        return memberships;

    } catch (error) {
        console.error('Error in listMyEvents service:', error);
        throw error;
    }
};

// Get all members of an event
const listMembers = async (eventId) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Get all memberships with user info
        const memberships = await EventUserRole.findAll({
            where: { eventId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'ASC']]
        });

        return memberships;

    } catch (error) {
        console.error('Error in listMembers service:', error);
        throw error;
    }
};

// Get organizers and co_organizers of an event
const listOrganizers = async (eventId) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Get organizers & co_organizers
        const organizers = await EventUserRole.findAll({
            where: {
                eventId,
                role: {
                    [Op.in]: ['organizer', 'co_organizer']
                }
            },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['role', 'ASC'], ['createdAt', 'ASC']]
        });

        return organizers;

    } catch (error) {
        console.error('Error in listOrganizers service:', error);
        throw error;
    }
};

// Update a user's role in an event
// (Authorization handled by middleware)
const updateMemberRole = async ({ eventId, userId, newRole }) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Validate role
        if (!VALID_ROLES.includes(newRole)) {
            const error = new Error('Invalid role provided');
            error.statusCode = 400;
            throw error;
        }

        // Check if membership exists
        const membership = await EventUserRole.findOne({
            where: { eventId, userId }
        });

        if (!membership) {
            const error = new Error('User is not a member of this event');
            error.statusCode = 404;
            throw error;
        }

        // Update role
        membership.role = newRole;
        await membership.save();

        return membership;

    } catch (error) {
        console.error('Error in updateMemberRole service:', error);
        throw error;
    }
};

// Remove a member from an event
// (Authorization handled by middleware)
const removeMember = async ({ eventId, userId }) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if membership exists
        const membership = await EventUserRole.findOne({
            where: { eventId, userId }
        });

        if (!membership) {
            const error = new Error('User is not a member of this event');
            error.statusCode = 404;
            throw error;
        }

        // Remove membership
        await membership.destroy();

        return;

    } catch (error) {
        console.error('Error in removeMember service:', error);
        throw error;
    }
};

module.exports = { joinEvent, leaveEvent, listMembers, listOrganizers, updateMemberRole, removeMember, listMyEvents };