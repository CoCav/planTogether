const request = require("supertest");

const app = require("../../../src/app");

/* ==========================================================================
   Auth Test Helper

   Builds reusable authenticated HTTP test setup.

   Responsibilities
   - Register test users
   - Retrieve authentication tokens
   - Build authorization headers
   - Return reusable authentication data

   Notes
   - Shared across integration tests.
   - Headers can be passed directly to Supertest `.set()`.
=========================================================================== */

const registerAndAuthenticateUser = async ({
    name = "Test User",
    email = `user${Date.now()}@test.com`,
    password = "Password123"
} = {}) => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({
            name,
            email,
            password
        });

    const { token, user } = response.body;

    return {
        token,
        user,
        email,
        password,
        headers: {
            Authorization: `Bearer ${token}`
        },
        response
    };
};

module.exports = {
    registerAndAuthenticateUser
};
