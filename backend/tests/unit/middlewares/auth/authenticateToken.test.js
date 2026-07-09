/* ==================================================
   AUTHENTICATE TOKEN MIDDLEWARE TESTS

   Tests:
   - missing Authorization header rejection
   - malformed Authorization header rejection
   - empty Bearer token rejection
   - invalid or expired token rejection
   - valid token authentication

   Ensures:
   - protected routes reject invalid authentication
   - decoded JWT payload is attached to req.user
   - authentication errors are forwarded to next()
   - next() is called only when token is valid
================================================== */

const jwt = require("jsonwebtoken");

const { authenticateToken } = require("../../../../src/middlewares/auth/authenticateToken");

const { createMockReqResNext } = require("../../../helpers/express/expressTestHelper");

jest.mock("jsonwebtoken");

describe("authenticateToken middleware", () => {

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

        jest.clearAllMocks();
    });

    /* =============================
       AUTHENTICATION SUCCESS
    ============================= */

    it("should attach user to request and call next when token is valid", () => {
        req.headers.authorization = "Bearer valid-token";

        const decodedToken = {
            userId: 1
        };

        jwt.verify.mockImplementation((token, secret, cb) => {
            cb(null, decodedToken);
        });

        authenticateToken(req, res, next);

        expect(req.user).toEqual(decodedToken);

        expect(next).toHaveBeenCalledWith();

        expect(res.status).not.toHaveBeenCalled();
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should forward 401 if authorization header is missing", () => {
        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 401,
                message: "Authorization header missing or malformed"
            })
        );

        expect(res.status).not.toHaveBeenCalled();
    });

    it("should forward 401 if authorization header is malformed", () => {
        req.headers.authorization = "InvalidToken";

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 401,
                message: "Authorization header missing or malformed"
            })
        );

        expect(res.status).not.toHaveBeenCalled();
    });

    it("should forward 401 if token is empty", () => {
        req.headers.authorization = "Bearer   ";

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 401,
                message: "No token provided"
            })
        );

        expect(res.status).not.toHaveBeenCalled();
    });

    it("should forward 401 if jwt verification fails", () => {
        req.headers.authorization = "Bearer invalid-token";

        jwt.verify.mockImplementation((token, secret, cb) => {
            cb(new Error("Invalid token"), null);
        });

        authenticateToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalled();

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 401,
                message: "Invalid or expired token"
            })
        );

        expect(res.status).not.toHaveBeenCalled();
    });
});
