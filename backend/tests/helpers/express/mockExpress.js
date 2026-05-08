/* ==================================================
   MOCK EXPRESS HELPERS

   Handles:
   - Express request mocking
   - Express response mocking
   - next() function mocking
   - reusable controller test setup

   Notes:
   - shared across unit controller and middleware tests
   - keep helpers generic and reusable
================================================== */

// Create mocked Express req / res / next objects
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

// Create generic controller mocks with authenticated user defaults
const createControllerMocks = ({
    body = {},
    params = {},
    query = {},
    user = { userId: 10 },
    file = undefined
} = {}) => {

    return createMockReqResNext({ body, params, query, user, file });
};

// Create user controller mocks with default public user id param
const createUserControllerMocks = ({
    params = { id: 1 },
    query = {},
    body = {},
    user = { userId: 10 },
    file = undefined
} = {}) => {
    return createMockReqResNext({ params, query, body, user, file });
};

// Create event controller mocks with default eventId param
const createEventControllerMocks = ({
    body = {},
    params = { eventId: "1" },
    query = {},
    user = { userId: 10 },
    file = undefined
} = {}) => {

    return createMockReqResNext({ body, params, query, user, file });
};

// Create event member authorization middleware mocks
const createEventMemberAuthorizationMocks = ({
    eventId = "1",
    targetUserId = "2",
    requesterUserId = 10,
    newRole = "co_organizer"
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

module.exports = { createMockReqResNext, createUserControllerMocks, createControllerMocks, createEventControllerMocks, createEventMemberAuthorizationMocks, createEventRoleMocks };
