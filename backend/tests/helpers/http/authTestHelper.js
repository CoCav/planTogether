const request = require("supertest");

const app = require("../../../src/app");

const {
    createRegistrationPayload,
    createLoginPayload
} = require("../../factories/userFactory");

/* ==========================================================================
   Authentication Test Helper

   Builds reusable authentication HTTP helpers.

   Responsibilities
   - Register users
   - Log users in
   - Log users out
   - Delete the authenticated user
   - Update the authenticated user's password
   - Register and authenticate users

   Notes
   - Shared across integration tests.
=========================================================================== */

/* =============================
   AUTH ACTIONS
============================= */

const registerUser = async (overrides = {}) => {
    const payload = createRegistrationPayload(overrides);

    const response = await request(app)
        .post("/api/auth/register")
        .send(payload);

    return {
        response,
        payload
    };
};

const loginUser = async (overrides = {}) => {
    const payload = createLoginPayload(overrides);

    return request(app)
        .post("/api/auth/login")
        .send(payload);
};

const logoutUser = (headers = {}) => {
    return request(app)
        .post("/api/auth/logout")
        .set(headers);
};

const deleteCurrentUser = (headers = {}) => {
    return request(app)
        .delete("/api/users/me")
        .set(headers);
};

const updateCurrentUserPassword = (
    headers = {},
    payload = {}
) => {
    return request(app)
        .put("/api/users/me/password")
        .set(headers)
        .send(payload);
};

/* =============================
   AUTH SCENARIOS
============================= */

const registerAndAuthenticateUser = async (overrides = {}) => {
    const { response, payload } = await registerUser(overrides);

    return {
        token: response.body.token,
        user: response.body.user,
        headers: {
            Authorization: `Bearer ${response.body.token}`
        },
        email: payload.email,
        password: payload.password,
        response
    };
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    deleteCurrentUser,
    updateCurrentUserPassword,
    registerAndAuthenticateUser
};
