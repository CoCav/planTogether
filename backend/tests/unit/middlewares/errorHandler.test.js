/* ==================================================
   ERROR HANDLER MIDDLEWARE TESTS

   Tests:
   - Multer upload error handling
   - Sequelize validation error handling
   - custom application error handling
   - default server error handling
   - custom errors array forwarding
   - production stack hiding

   Ensures:
   - API errors are formatted consistently
   - upload errors return clear messages
   - ORM validation errors are formatted consistently
   - production responses do not expose stack traces
================================================== */

const multer = require("multer");
const errorHandler = require("../../../src/middlewares/errorHandler");

const { createMockReqResNext } = require("../../helpers/express/mockExpress");
const { mockConsoleError } = require("../../helpers/mocks/consoleMocks");

describe("errorHandler middleware", () => {

    const originalEnv = process.env.NODE_ENV;

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = "test";
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    /* =============================
       MULTER ERRORS
    ============================= */

    it("should handle Multer file size errors", () => {
        const { req, res, next } = createMockReqResNext();

        const error = new multer.MulterError("LIMIT_FILE_SIZE");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "File too large. Maximum size exceeded."
        });
    });

    it("should handle generic Multer errors", () => {
        const { req, res, next } = createMockReqResNext();

        const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unexpected field"
        });
    });

    /* =============================
       SEQUELIZE ERRORS
    ============================= */

    it("should handle Sequelize validation errors", () => {
        const { req, res, next } = createMockReqResNext();

        const error = {
            name: "SequelizeValidationError",
            errors: [
                { path: "email", message: "Email is invalid" },
                { path: "name", message: "Name is required" }
            ]
        };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Validation error",
            errors: [
                { field: "email", message: "Email is invalid" },
                { field: "name", message: "Name is required" }
            ]
        });
    });

    it("should handle Sequelize unique constraint errors", () => {
        const { req, res, next } = createMockReqResNext();

        const error = {
            name: "SequelizeUniqueConstraintError",
            errors: [
                { path: "email", message: "Email already exists" }
            ]
        };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Validation error",
            errors: [
                { field: "email", message: "Email already exists" }
            ]
        });
    });

    /* =============================
       CUSTOM / DEFAULT ERRORS
    ============================= */

    it("should handle custom errors with statusCode", () => {
        const { req, res, next } = createMockReqResNext();

        const error = new Error("Not found");
        error.statusCode = 404;

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Not found",
                stack: expect.any(String)
            })
        );
    });

    it("should default to 500 when statusCode is missing", () => {
        const { req, res, next } = createMockReqResNext();

        const error = new Error("Something went wrong");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Something went wrong"
            })
        );
    });

    it("should use default message when error message is missing", () => {
        const { req, res, next } = createMockReqResNext();

        const error = {
            statusCode: 500
        };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        );
    });

    it("should include custom errors array when provided", () => {
        const { req, res, next } = createMockReqResNext();

        const error = new Error("Bad request");
        error.statusCode = 400;
        error.errors = [
            { field: "email", message: "Invalid email" }
        ];

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Bad request",
                errors: [
                    { field: "email", message: "Invalid email" }
                ]
            })
        );
    });

    /* =============================
       PRODUCTION BEHAVIOR
    ============================= */

    it("should not include stack in production", () => {
        process.env.NODE_ENV = "production";

        const { req, res, next } = createMockReqResNext();

        const error = new Error("Production error");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        const payload = res.json.mock.calls[0][0];

        expect(payload).toMatchObject({
            success: false,
            message: "Production error"
        });

        expect(payload.stack).toBeUndefined();
    });
});
