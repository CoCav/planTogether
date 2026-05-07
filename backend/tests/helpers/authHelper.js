/* ==================================================
   AUTH TEST HELPERS

   Handles:
   - test user registration
   - authenticated token retrieval
   - reusable authenticated test users

   Notes:
   - shared across integration tests
   - returns auth token + created user data
================================================== */

const request = require("supertest");
const app = require("../../src/app");

// Register test user and return auth data
const registerAndGetToken = async ({ name = "Test User", email = `user${Date.now()}@test.com`, password = "Password123" } = {}) => {

    const res = await request(app)
        .post("/api/auth/register")
        .send({
            name,
            email,
            password
        });

    return {
        token: res.body.token,
        user: res.body.user,
        email,
        password,
        headers: {
            Authorization: `Bearer ${res.body.token}`
        },
        response: res
    };
};

module.exports = { registerAndGetToken };
