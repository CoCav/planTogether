/* ==================================================
   ERROR HANDLER MIDDLEWARE TESTS

   Tests:
   - Multer upload errors
   - custom application errors
   - default server errors
   - custom validation error arrays
   - Sequelize validation errors
   - production stack hiding

   Ensures:
   - API errors are formatted consistently
   - upload errors return clear messages
   - production responses do not expose stack traces
================================================== */

const multer = require("multer");
const errorHandler = require("../../../src/middlewares/errorHandler");

// Create mocked Express request/response objects
const createMocks = () => {
    const req = {};

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

describe("errorHandler middleware", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
        process.env.NODE_ENV = "test";
    });

    afterEach(() => {
        console.error.mockRestore();
        process.env.NODE_ENV = originalEnv;
    });

    /* =============================
       MULTER ERRORS
    ============================= */

    it("should handle Multer file size errors", () => {
        const { req, res, next } = createMocks();

        const error = new multer.MulterError("LIMIT_FILE_SIZE");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "File too large. Maximum size exceeded."
        });
    });

    it("should handle generic Multer errors", () => {
        const { req, res, next } = createMocks();

        const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unexpected field"
        });
    });

    /* =============================
       CUSTOM / DEFAULT ERRORS
    ============================= */

    it("should handle generic errors with statusCode", () => {
        const { req, res, next } = createMocks();

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
        const { req, res, next } = createMocks();

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
        const { req, res, next } = createMocks();

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
        const { req, res, next } = createMocks();

        const error = new Error("Bad request");
        error.statusCode = 400;
        error.errors = [{ field: "email", message: "Invalid email" }];

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Bad request",
                errors: [{ field: "email", message: "Invalid email" }]
            })
        );
    });

    /* =============================
       SEQUELIZE ERRORS
    ============================= */

    it("should handle Sequelize validation errors", () => {
        const { req, res, next } = createMocks();

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
        const { req, res, next } = createMocks();

        const error = {
            name: "SequelizeUniqueConstraintError",
            errors: [{ path: "email", message: "Email already exists" }]
        };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Validation error",
            errors: [{ field: "email", message: "Email already exists" }]
        });
    });

    /* =============================
       PRODUCTION BEHAVIOR
    ============================= */

    it("should not include stack in production", () => {
        process.env.NODE_ENV = "production";

        const { req, res, next } = createMocks();

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
