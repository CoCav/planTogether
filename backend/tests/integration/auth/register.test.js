const request = require("supertest");

const app = require("../../../src/app");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerUser } = require("../../helpers/http/authTestHelper");

const { createRegistrationPayload } = require("../../factories/userFactory");

/* ==========================================================================
   Auth Integration Tests - Register

   Tests user registration behavior.

   Responsibilities
   - Test successful registration
   - Test avatar upload during registration
   - Test email normalization
   - Test validation errors
   - Test upload errors
   - Test duplicate email handling

   Notes
   - Passwords must never be exposed in responses.
   - Uploaded avatar paths should be returned when registration succeeds.
=========================================================================== */

describe("Register API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       REGISTER SUCCESS
    ============================= */

    describe("Register success", () => {
        it("registers a new user", async () => {
            const payload = createRegistrationPayload();

            const { response } = await registerUser(payload);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("message", "User registered successfully");
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("user");

            expect(response.body.user).toMatchObject({
                name: payload.name,
                email: payload.email,
                avatar: null
            });

            expect(response.body.user).not.toHaveProperty("password");
        });

        it("registers a new user with avatar upload", async () => {
            const payload = createRegistrationPayload({
                name: "Avatar User",
                email: `avatar${Date.now()}@test.com`
            });

            const response = await request(app)
                .post("/api/auth/register")
                .field("name", payload.name)
                .field("email", payload.email)
                .field("password", payload.password)
                .attach("avatar", Buffer.from("fake image content"), {
                    filename: "avatar.png",
                    contentType: "image/png"
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("message", "User registered successfully");
            expect(response.body).toHaveProperty("token");

            expect(response.body.user).toMatchObject({
                name: payload.name,
                email: payload.email
            });

            expect(response.body.user.avatar).toMatch(/^\/uploads\/avatars\/avatar-/);
            expect(response.body.user).not.toHaveProperty("password");
        });
    });

    /* =============================
       EMAIL NORMALIZATION
    ============================= */

    describe("Email normalization", () => {
        it("normalizes email before saving", async () => {
            const { response } = await registerUser({
                name: "Normalized User",
                email: "  TEST@Example.COM  ",
                password: "Password123"
            });

            expect(response.statusCode).toBe(201);
            expect(response.body.user.email).toBe("test@example.com");
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects registration with missing fields", async () => {
            const { response } = await registerUser({
                name: "",
                email: "",
                password: ""
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects registration with invalid email", async () => {
            const { response } = await registerUser({
                name: "Invalid Email User",
                email: "not-an-email",
                password: "Password123"
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects registration with weak password", async () => {
            const { response } = await registerUser({
                name: "Weak Password User",
                email: `weak${Date.now()}@test.com`,
                password: "abc"
            });

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       FILE UPLOAD ERRORS
    ============================= */

    describe("File upload errors", () => {
        it("rejects invalid avatar file type", async () => {
            const payload = createRegistrationPayload({
                name: "Invalid Avatar User",
                email: `invalidavatar${Date.now()}@test.com`
            });

            const response = await request(app)
                .post("/api/auth/register")
                .field("name", payload.name)
                .field("email", payload.email)
                .field("password", payload.password)
                .attach("avatar", Buffer.from("fake file"), {
                    filename: "avatar.txt",
                    contentType: "text/plain"
                });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid avatar extension even with image mimetype", async () => {
            const payload = createRegistrationPayload({
                name: "Invalid Extension User",
                email: `invalidext${Date.now()}@test.com`
            });

            const response = await request(app)
                .post("/api/auth/register")
                .field("name", payload.name)
                .field("email", payload.email)
                .field("password", payload.password)
                .attach("avatar", Buffer.from("fake image"), {
                    filename: "avatar.txt",
                    contentType: "image/png"
                });

            expect(response.statusCode).toBe(400);
        });

        it("rejects avatar file that exceeds size limit", async () => {
            const payload = createRegistrationPayload({
                name: "Large Avatar User",
                email: `largeavatar${Date.now()}@test.com`
            });

            const largeBuffer = Buffer.alloc(3 * 1024 * 1024);

            const response = await request(app)
                .post("/api/auth/register")
                .field("name", payload.name)
                .field("email", payload.email)
                .field("password", payload.password)
                .attach("avatar", largeBuffer, {
                    filename: "large-avatar.png",
                    contentType: "image/png"
                });

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects duplicate email", async () => {
            const payload = createRegistrationPayload({
                email: `duplicate${Date.now()}@test.com`
            });

            await registerUser({
                ...payload,
                name: "First User"
            });

            const { response } = await registerUser({
                ...payload,
                name: "Second User"
            });

            expect(response.statusCode).toBe(409);
        });

        it("rejects duplicate email with different casing", async () => {
            const email = `duplicatecase${Date.now()}@test.com`;

            await registerUser({
                name: "First User",
                email,
                password: "Password123"
            });

            const { response } = await registerUser({
                name: "Second User",
                email: email.toUpperCase(),
                password: "Password123"
            });

            expect(response.statusCode).toBe(409);
        });
    });
});
