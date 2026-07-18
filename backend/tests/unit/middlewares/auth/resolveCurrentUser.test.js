/* =============================
   TEST MOCKS
============================= */

jest.mock("jsonwebtoken");

/* =============================
   TEST IMPORTS
============================= */

const jwt = require("jsonwebtoken");

const { resolveCurrentUser } = require("../../../../src/middlewares/auth/resolveCurrentUser");

const {
    createMockReqResNext,
    expectNoResponseSent
} = require("../../../helpers/express/expressTestHelper");

/* ==========================================================================
   Resolve Current User Middleware Unit Tests

   Tests optional authenticated user resolution.

   Responsibilities
   - Test valid Bearer token resolution
   - Test anonymous request handling
   - Test Authorization header validation
   - Test invalid token fallback
   - Test current user injection

   Notes
   - JWT verification is mocked.
   - Missing or invalid authentication never blocks public requests.
=========================================================================== */

describe("resolveCurrentUser middleware", () => {
    const originalJwtSecret = process.env.JWT_SECRET;

    let req;
    let res;
    let next;

    beforeEach(() => {
        const mocks = createMockReqResNext({
            headers: {}
        });

        req = mocks.req;
        res = mocks.res;
        next = mocks.next;

        process.env.JWT_SECRET = "test-secret";

        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env.JWT_SECRET = originalJwtSecret;
    });

    /* =============================
       CURRENT USER RESOLUTION
    ============================= */

    describe("Valid authentication", () => {
        it("attaches the decoded user when the token is valid", () => {
            req.headers.authorization = "Bearer valid-token";

            const decodedToken = {
                userId: 1
            };

            jwt.verify.mockReturnValue(decodedToken);

            resolveCurrentUser(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                "valid-token",
                "test-secret"
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

            jwt.verify.mockReturnValue(decodedToken);

            resolveCurrentUser(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                "valid-token",
                "test-secret"
            );

            expect(req.user).toBe(decodedToken);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
    });

    /* =============================
       ANONYMOUS REQUESTS
    ============================= */

    describe("Anonymous request handling", () => {
        it.each([
            ["missing Authorization header", undefined],
            ["malformed Authorization header", "InvalidToken"],
            ["empty Bearer token", "Bearer   "]
        ])(
            "continues anonymously for a %s",
            (_, authorization) => {
                if (authorization !== undefined) {
                    req.headers.authorization = authorization;
                }

                resolveCurrentUser(req, res, next);

                expect(jwt.verify).not.toHaveBeenCalled();
                expect(req.user).toBeUndefined();

                expect(next).toHaveBeenCalledTimes(1);
                expect(next).toHaveBeenCalledWith();

                expectNoResponseSent(res);
            }
        );
    });

    /* =============================
       INVALID TOKEN FALLBACK
    ============================= */

    describe("Invalid token handling", () => {
        it("continues anonymously and clears the current user", () => {
            req.headers.authorization = "Bearer invalid-token";

            jwt.verify.mockImplementation(() => {
                throw new Error("Invalid token");
            });

            resolveCurrentUser(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                "invalid-token",
                "test-secret"
            );

            expect(req.user).toBeNull();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();

            expectNoResponseSent(res);
        });

        it("replaces an existing user value when token verification fails", () => {
            req.headers.authorization = "Bearer expired-token";

            req.user = {
                userId: 99
            };

            jwt.verify.mockImplementation(() => {
                throw new Error("Expired token");
            });

            resolveCurrentUser(req, res, next);

            expect(req.user).toBeNull();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
    });
});
