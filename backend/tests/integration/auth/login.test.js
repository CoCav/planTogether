const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const {
    registerAndAuthenticateUser,
    loginUser
} = require("../../helpers/http/authTestHelper");

const { deleteCurrentUser } = require("../../helpers/http/authTestHelper");

/* ==========================================================================
   Auth Integration Tests - Login

   Tests user login behavior.

   Responsibilities
   - Test successful login
   - Test normalized email login
   - Test validation errors
   - Test authentication errors
   - Test response security

   Notes
   - Login must return a JWT token for valid credentials.
   - Passwords must never be exposed in responses.
   - Deleted accounts cannot log in.
=========================================================================== */

describe("Login API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       LOGIN SUCCESS
    ============================= */

    describe("Login success", () => {
        it("logs in an existing user", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Login User",
                email: `login${Date.now()}@test.com`,
                password: "Password123"
            });

            const response = await loginUser({
                email: userAuth.email,
                password: userAuth.password
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Login successful");
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("user");

            expect(response.body.user).toMatchObject({
                name: "Login User",
                email: userAuth.email
            });

            expect(response.body.user).not.toHaveProperty("password");
        });
    });

    /* =============================
       EMAIL NORMALIZATION
    ============================= */

    describe("Email normalization", () => {
        it("logs in with normalized email", async () => {
            await registerAndAuthenticateUser({
                name: "Normalized Login User",
                email: "normalized@test.com",
                password: "Password123"
            });

            const response = await loginUser({
                email: "  NORMALIZED@Test.com  ",
                password: "Password123"
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Login successful");
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects missing fields", async () => {
            const response = await loginUser({
                email: "",
                password: ""
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid email format", async () => {
            const response = await loginUser({
                email: "bad-email",
                password: "Password123"
            });

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects wrong password", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Wrong Password User",
                email: `wrong${Date.now()}@test.com`,
                password: "Password123"
            });

            const response = await loginUser({
                email: userAuth.email,
                password: "WrongPassword"
            });

            expect(response.statusCode).toBe(401);
        });

        it("rejects unknown email", async () => {
            const response = await loginUser({
                email: `unknown${Date.now()}@test.com`,
                password: "Password123"
            });

            expect(response.statusCode).toBe(401);
        });

        it("rejects login after account deletion", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Deleted Login User",
                email: `deletedlogin${Date.now()}@test.com`,
                password: "Password123"
            });

            await deleteCurrentUser(userAuth.headers);

            const response = await loginUser({
                email: userAuth.email,
                password: userAuth.password
            });

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       RESPONSE SECURITY
    ============================= */

    describe("Response security", () => {
        it("does not expose the password in login response", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Hidden Password User",
                email: `hidden${Date.now()}@test.com`,
                password: "Password123"
            });

            const response = await loginUser({
                email: userAuth.email,
                password: userAuth.password
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.user).not.toHaveProperty("password");
        });
    });
});
