/* ==================================================
   AUTHENTICATE TOKEN MIDDLEWARE TESTS

   Tests:
   - missing Authorization header
   - malformed Authorization header
   - empty Bearer token
   - invalid or expired token
   - valid token authentication

   Ensures:
   - protected routes reject invalid authentication
   - decoded JWT payload is attached to req.user
   - next() is called only when token is valid
================================================== */

const { authenticateToken } = require("../../../src/middlewares/authenticateToken");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

describe("authenticateToken middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        jest.clearAllMocks();
    });

    it("should return 401 if authorization header is missing", () => {
        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Authorization header missing or malformed"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if header does not start with Bearer", () => {
        req.headers.authorization = "InvalidToken";

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is empty", () => {
        req.headers.authorization = "Bearer   ";

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "No token provided"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if jwt verification fails", () => {
        req.headers.authorization = "Bearer validtoken";

        jwt.verify.mockImplementation((token, secret, cb) => {
            cb(new Error("Invalid token"), null);
        });

        authenticateToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid or expired token"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should attach user to request and call next when token is valid", () => {
        req.headers.authorization = "Bearer validtoken";

        const decoded = { userId: 1 };

        jwt.verify.mockImplementation((token, secret, cb) => {
            cb(null, decoded);
        });

        authenticateToken(req, res, next);

        expect(req.user).toEqual(decoded);
        expect(next).toHaveBeenCalled();
    });
});
