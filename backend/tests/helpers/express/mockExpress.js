const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

/* ==================================================
   MOCK EXPRESS HELPERS

   Handles:
   - Express request mocking
   - Express response mocking
   - next() function mocking
   - reusable controller and middleware test setup

   Notes:
   - shared across unit controller and middleware tests
   - provides both low-level and domain-specific helpers
   - keep helpers focused and reusable
================================================== */

const defaultAuthUser = {
    userId: 10
};

// Create low-level mocked Express req / res / next objects
const createMockReqResNext = ({
    params = {},
    query = {},
    body = {},
    user = undefined,
    file = undefined
} = {}) => {

    const req = { params, query, body, user, file };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

// Create auth controller mocks
const createAuthControllerMocks = ({
    body = {},
    user = defaultAuthUser,
    file = undefined
} = {}) => {

    return createMockReqResNext({ body, user, file });
};

// Create user controller mocks
const createUserControllerMocks = ({
    params = { id: 1 },
    query = {},
    body = {},
    user = defaultAuthUser,
    file = undefined
} = {}) => {

    return createMockReqResNext({ params, query, body, user, file });
};

// Create event controller mocks
const createEventControllerMocks = ({
    body = {},
    params = { eventId: "1" },
    query = {},
    user = defaultAuthUser,
    file = undefined
} = {}) => {

    return createMockReqResNext({ body, params, query, user, file });
};

// Create event member authorization middleware mocks
const createEventMemberAuthorizationMocks = ({
    eventId = "1",
    targetUserId = "2",
    requesterUserId = 10,
    newRole = EVENT_ROLES.CO_ORGANIZER
} = {}) => {

    return createMockReqResNext({
        params: {
            eventId,
            userId: targetUserId
        },

        user: {
            userId: requesterUserId
        },

        body: {
            newRole
        }
    });
};

// Create event role middleware mocks
const createEventRoleMocks = ({
    eventId = "1",
    userId = 1
} = {}) => {

    return createMockReqResNext({
        params: { eventId },
        user: { userId }
    });
};

module.exports = {
    createMockReqResNext,
    createAuthControllerMocks,
    createUserControllerMocks,
    createEventControllerMocks,
    createEventMemberAuthorizationMocks,
    createEventRoleMocks
};
