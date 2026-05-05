/* ==================================================
   AUTH INTEGRATION - REGISTER

   Tests:
   - successful user registration
   - avatar upload during registration
   - missing fields rejection
   - invalid email rejection
   - weak password rejection
   - duplicate email rejection

   Ensures:
   - full registration pipeline works end-to-end
   - uploaded avatar paths are returned correctly
   - password is never exposed
   - database persistence works correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

describe("Register API", () => {
    beforeAll(async () => {
        await initDB();
    });

    afterEach(async () => {
        await EventUserRole.destroy({ where: {} });
        await Event.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    afterAll(async () => {
        await sequelize.close();
    });

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
        expect(res.body).toHaveProperty("token");

        expect(res.body.user).toMatchObject({
            name: "Avatar User",
            email
        });

        expect(res.body.user.avatar).toMatch(/^\/uploads\/avatars\/avatar-/);
        expect(res.body.user).not.toHaveProperty("password");
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject registration with missing fields", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "", email: "", password: "" });

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
       BUSINESS RULES
    ============================= */

    it("should reject duplicate email", async () => {
        const email = `duplicate${Date.now()}@test.com`;

        await request(app).post("/api/auth/register").send({
            name: "First User",
            email,
            password: "Password123"
        });

        const res = await request(app).post("/api/auth/register").send({
            name: "Second User",
            email,
            password: "Password123"
        });

        expect(res.statusCode).toBe(409);
    });
});
