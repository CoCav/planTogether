const request = require("supertest");

const app = require("../../../src/app");

const { User } = require("../../../src/models");

/* ==========================================================================
   User Test Helper

   Builds reusable user HTTP and lookup helpers.

   Responsibilities
   - Find users by email
   - Retrieve participant identifiers
   - Retrieve organizer identifiers
   - Retrieve co-organizer identifiers
   - Retrieve current authenticated user profile
   - Retrieve current authenticated user events
   - Update current authenticated user profile
   - Update current authenticated user avatar
   - Retrieve public user profile
   - Retrieve public user events

   Notes
   - Shared across user integration tests.
=========================================================================== */

/* =============================
   USER LOOKUPS
============================= */

const findUserByEmail = async (email) => {
    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        throw new Error(`Test user not found for email: ${email}`);
    }

    return user;
};

const findUserIdByEmail = async (email) => {
    const user = await findUserByEmail(email);
    return user.id;
};

const findParticipantId = (participantAuth) => {
    return findUserIdByEmail(participantAuth.email);
};

const findOrganizerId = (organizerAuth) => {
    return findUserIdByEmail(organizerAuth.email);
};

const findCoOrganizerId = (coOrganizerAuth) => {
    return findUserIdByEmail(coOrganizerAuth.email);
};

/* =============================
   CURRENT USER
============================= */

const getCurrentUserProfile = (headers = {}) => {
    return request(app)
        .get("/api/users/me")
        .set(headers);
};

const getCurrentUserEvents = ({ headers = {}, query = {} } = {}) => {
    return request(app)
        .get("/api/users/me/events")
        .set(headers)
        .query(query);
};

const updateCurrentUserProfile = (headers = {}, payload = {}) => {
    return request(app)
        .put("/api/users/me")
        .set(headers)
        .send(payload);
};

const updateCurrentUserAvatar = (headers = {}, image = {}) => {
    return request(app)
        .put("/api/users/me")
        .set(headers)
        .attach(
            "avatar",
            image.buffer ?? Buffer.from("avatar image"),
            {
                filename: image.filename ?? "avatar.png",
                contentType: image.contentType ?? "image/png"
            }
        );
};

/* =============================
   PUBLIC USER
============================= */

const getPublicUserProfile = (userId) => {
    return request(app).get(`/api/users/${userId}`);
};

const getPublicUserEvents = ({ userId, headers = {}, query = {} }) => {
    return request(app)
        .get(`/api/users/${userId}/events`)
        .set(headers)
        .query(query);
};

module.exports = {
    findUserByEmail,
    findUserIdByEmail,
    findParticipantId,
    findOrganizerId,
    findCoOrganizerId,

    getCurrentUserProfile,
    getCurrentUserEvents,
    updateCurrentUserProfile,
    updateCurrentUserAvatar,

    getPublicUserProfile,
    getPublicUserEvents
};
