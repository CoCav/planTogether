/* ==================================================
   AUTH INTEGRATION - REGISTER TESTS

   Tests:
   - successful user registration
   - avatar upload during registration
   - email normalization
   - missing fields rejection
   - invalid email rejection
   - weak password rejection
   - invalid avatar file type rejection
   - invalid avatar extension rejection
   - oversized avatar rejection
   - duplicate email rejection
   - duplicate email casing rejection

   Ensures:
   - full registration pipeline works end-to-end
   - uploaded avatar paths are returned correctly
   - emails are normalized before persistence
   - password is never exposed
   - database persistence works correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

describe("Register API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       REGISTER SUCCESS
    ============================= */

    it("should register a new user", async () => {
        const email = `test${Date.now()}@test.com`;

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email,
                password: "Password123"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");

        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("user");

        expect(res.body.user).toMatchObject({
            name: "Test User",
            email,
            avatar: null
        });

        expect(res.body.user).not.toHaveProperty("password");
    });

    it("should register a new user with avatar upload", async () => {
        const email = `avatar${Date.now()}@test.com`;

        const res = await request(app)
            .post("/api/auth/register")
            .field("name", "Avatar User")
            .field("email", email)
            .field("password", "Password123")
            .attach("avatar", Buffer.from("fake image content"), {
                filename: "avatar.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
        expect(res.body).toHaveProperty("token");

        expect(res.body.user).toMatchObject({
            name: "Avatar User",
            email
        });

        expect(res.body.user.avatar).toMatch(/^\/uploads\/avatars\/avatar-/);

        expect(res.body.user).not.toHaveProperty("password");
    });

    /* =============================
       DATA NORMALIZATION
    ============================= */

    it("should normalize email before saving", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Normalized User",
                email: "  TEST@Example.COM  ",
                password: "Password123"
            });

        expect(res.statusCode).toBe(201);

        expect(res.body.user.email).toBe("test@example.com");
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject registration with missing fields", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "",
                email: "",
                password: ""
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject registration with invalid email", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Invalid Email User",
                email: "not-an-email",
                password: "Password123"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject registration with weak password", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Weak Password User",
                email: `weak${Date.now()}@test.com`,
                password: "abc"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       FILE UPLOADS
    ============================= */

    it("should reject invalid avatar file type", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .field("name", "Invalid Avatar User")
            .field("email", `invalidavatar${Date.now()}@test.com`)
            .field("password", "Password123")
            .attach("avatar", Buffer.from("fake file"), {
                filename: "avatar.txt",
                contentType: "text/plain"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid avatar extension even with image mimetype", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .field("name", "Invalid Extension User")
            .field("email", `invalidext${Date.now()}@test.com`)
            .field("password", "Password123")
            .attach("avatar", Buffer.from("fake image"), {
                filename: "avatar.txt",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject avatar file that exceeds size limit", async () => {
        const largeBuffer = Buffer.alloc(3 * 1024 * 1024);

        const res = await request(app)
            .post("/api/auth/register")
            .field("name", "Large Avatar User")
            .field("email", `largeavatar${Date.now()}@test.com`)
            .field("password", "Password123")
            .attach("avatar", largeBuffer, {
                filename: "large-avatar.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject duplicate email", async () => {
        const email = `duplicate${Date.now()}@test.com`;

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "First User",
                email,
                password: "Password123"
            });

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Second User",
                email,
                password: "Password123"
            });

        expect(res.statusCode).toBe(409);
    });

    it("should reject duplicate email with different casing", async () => {
        const email = `duplicatecase${Date.now()}@test.com`;

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "First User",
                email,
                password: "Password123"
            });

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Second User",
                email: email.toUpperCase(),
                password: "Password123"
            });

        expect(res.statusCode).toBe(409);
    });
});
