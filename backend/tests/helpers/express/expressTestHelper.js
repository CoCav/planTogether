const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

/* ==========================================================================
   Express Test Helper

   Builds reusable Express request, response and next mocks.

   Responsibilities
   - Build mock request objects
   - Build mock response objects
   - Build mock next functions
   - Build controller-specific mocks
   - Build middleware-specific mocks

   Notes
   - Shared across controller and middleware unit tests.
   - Domain-specific helpers should stay thin wrappers around createMockReqResNext.
=========================================================================== */

const DEFAULT_AUTH_USER = {
    userId: 10
};

const createMockReqResNext = ({
    params = {},
    query = {},
    body = {},
    user = undefined,
    file = undefined,
    headers = {}
} = {}) => {
    const req = {
        params,
        query,
        body,
        user,
        file,
        headers
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return {
        req,
        res,
        next
    };
};

const createAuthControllerMocks = ({
    body = {},
    user = DEFAULT_AUTH_USER,
    file = undefined
} = {}) => {
    return createMockReqResNext({
        body,
        user,
        file
    });
};

const createUserControllerMocks = ({
    params = { id: 1 },
    query = {},
    body = {},
    user = DEFAULT_AUTH_USER,
    file = undefined
} = {}) => {
    return createMockReqResNext({
        params,
        query,
        body,
        user,
        file
    });
};

const createEventControllerMocks = ({
    body = {},
    params = { eventId: "1" },
    query = {},
    user = DEFAULT_AUTH_USER,
    file = undefined
} = {}) => {
    return createMockReqResNext({
        body,
        params,
        query,
        user,
        file
    });
};

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

const createEventRoleMocks = ({
    eventId = "1",
    userId = 1
} = {}) => {
    return createMockReqResNext({
        params: {
            eventId
        },
        user: {
            userId
        }
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
