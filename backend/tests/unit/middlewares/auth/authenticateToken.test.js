const jwt = require("jsonwebtoken");

const { authenticateToken } = require("../../../../src/middlewares/auth/authenticateToken");

const {
    createMockReqResNext,
    expectNoResponseSent
} = require("../../../helpers/express/expressTestHelper");

/* ==========================================================================
   Authenticate Token Middleware Unit Tests

   Tests protected request authentication.

   Responsibilities
   - Test valid Bearer token authentication
   - Test Authorization header validation
   - Test JWT verification errors
   - Test authenticated user injection
   - Test token whitespace normalization

   Notes
   - JWT verification is mocked.
   - Authentication failures are forwarded to next().
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("jsonwebtoken");

describe("authenticateToken middleware", () => {
    const originalJwtSecret = process.env.JWT_SECRET;

    let req;
    let res;
    let next;

    beforeEach(() => {
        const mocks = createMockReqResNext();

        req = {
            ...mocks.req,
            headers: {}
        };

        res = mocks.res;
        next = mocks.next;

        process.env.JWT_SECRET = "test-secret";

        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env.JWT_SECRET = originalJwtSecret;
    });

    /* =============================
       AUTHENTICATION SUCCESS
    ============================= */

    describe("Valid authentication", () => {
        it("attaches the decoded user and calls next for a valid token", () => {
            req.headers.authorization = "Bearer valid-token";

            const decodedToken = {
                userId: 1
            };

            jwt.verify.mockImplementation(
                (token, secret, callback) => {
                    callback(null, decodedToken);
                }
            );

            authenticateToken(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                "valid-token",
                "test-secret",
                expect.any(Function)
            );

            expect(req.user).toBe(decodedToken);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();

            expectNoResponseSent(res);
        });

        it("trims extra whitespace around the Bearer token", () => {
            req.headers.authorization = "Bearer      valid-token   ";

            const decodedToken = {
                userId: 42
            };

            jwt.verify.mockImplementation(
                (token, secret, callback) => {
                    callback(null, decodedToken);
                }
            );

            authenticateToken(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                "valid-token",
                "test-secret",
                expect.any(Function)
            );

            expect(req.user).toBe(decodedToken);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
    });

    /* =============================
       AUTHORIZATION HEADER ERRORS
    ============================= */

    describe("Authorization header errors", () => {
        it("forwards 401 when the Authorization header is missing", () => {
            authenticateToken(req, res, next);

            expect(jwt.verify).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 401,
                    message: "Authorization header missing or malformed"
                })
            );

            expectNoResponseSent(res);
        });

        it("forwards 401 when the Authorization header is malformed", () => {
            req.headers.authorization = "InvalidToken";

            authenticateToken(req, res, next);

            expect(jwt.verify).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 401,
                    message: "Authorization header missing or malformed"
                })
            );

            expectNoResponseSent(res);
        });

        it("forwards 401 when the Bearer token is empty", () => {
            req.headers.authorization = "Bearer   ";

            authenticateToken(req, res, next);

            expect(jwt.verify).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 401,
                    message: "No token provided"
                })
            );

            expectNoResponseSent(res);
        });
    });

    /* =============================
       JWT VERIFICATION ERRORS
    ============================= */

    describe("JWT verification errors", () => {
        it("forwards 401 when JWT verification fails", () => {
            req.headers.authorization = "Bearer invalid-token";

            jwt.verify.mockImplementation(
                (token, secret, callback) => {
                    callback(
                        new Error("Invalid token"),
                        null
                    );
                }
            );

            authenticateToken(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                "invalid-token",
                "test-secret",
                expect.any(Function)
            );

            expect(req.user).toBeUndefined();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 401,
                    message: "Invalid or expired token"
                })
            );

            expectNoResponseSent(res);
        });
    });
});
