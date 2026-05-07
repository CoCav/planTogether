/* ==================================================
   AUTH INTEGRATION - LOGIN

   Tests:
   - successful login
   - normalized email login
   - missing fields rejection
   - invalid email rejection
   - wrong password rejection
   - unknown email rejection
   - password exposure protection

   Ensures:
   - validators run correctly
   - credentials are verified
   - JWT token is returned
   - normalized emails are supported
   - password is never exposed
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");

describe("Login API", () => {

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
       LOGIN SUCCESS
    ============================= */

    it("should login an existing user", async () => {
        const userAuth = await registerAndGetToken({
            name: "Login User",
            email: `login${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: userAuth.email,
                password: userAuth.password
            });

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty(
            "message",
            "Login successful"
        );

        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("user");

        expect(res.body.user).toMatchObject({
            name: "Login User",
            email: userAuth.email
        });

        expect(res.body.user).not.toHaveProperty("password");
    });

    it("should login with normalized email", async () => {
        await registerAndGetToken({
            name: "Normalized Login User",
            email: "normalized@test.com",
            password: "Password123"
        });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "  NORMALIZED@Test.com  ",
                password: "Password123"
            });

        expect(res.statusCode).toBe(200);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject missing fields", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "",
                password: ""
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid email format", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "bad-email",
                password: "Password123"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject wrong password", async () => {
        const userAuth = await registerAndGetToken({
            name: "Wrong Password User",
            email: `wrong${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: userAuth.email,
                password: "WrongPassword"
            });

        expect(res.statusCode).toBe(401);
    });

    it("should reject unknown email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: `unknown${Date.now()}@test.com`,
                password: "Password123"
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       RESPONSE SECURITY
    ============================= */

    it("should never expose password in login response", async () => {
        const userAuth = await registerAndGetToken({
            name: "Hidden Password User",
            email: `hidden${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: userAuth.email,
                password: userAuth.password
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.user).not.toHaveProperty("password");
    });
});
