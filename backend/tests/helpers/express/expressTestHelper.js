const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

/* ==========================================================================
   Express Test Helper

   Builds reusable Express request, response and next mocks.

   Responsibilities
   - Build generic Express middleware mocks
   - Build controller-specific request contexts
   - Build authorization middleware contexts
   - Assert HTTP response behavior

   Notes
   - Shared across controller and middleware unit tests.
   - Domain-specific helpers stay thin wrappers around createMockReqResNext.
=========================================================================== */

const DEFAULT_AUTH_USER = {
    userId: 10
};

/* =============================
   GENERIC EXPRESS MOCKS
============================= */

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

/* =============================
   CONTROLLER MOCKS
============================= */

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

/* =============================
   AUTHORIZATION MIDDLEWARE MOCKS
============================= */

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

/* =============================
   RESPONSE ASSERTIONS
============================= */

const expectNoResponseSent = (res) => {
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
};

const expectJsonResponse = (
    res,
    statusCode,
    payload
) => {
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(statusCode);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(payload);
};

module.exports = {
    createMockReqResNext,

    createAuthControllerMocks,
    createUserControllerMocks,
    createEventControllerMocks,
    createEventMemberAuthorizationMocks,
    createEventRoleMocks,

    expectNoResponseSent,
    expectJsonResponse
};
