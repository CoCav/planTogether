/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/config/logger", () => ({
    error: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const multer = require("multer");

const logger = require("../../../../src/config/logger");

const errorHandler = require("../../../../src/middlewares/errors/errorHandler");

const { createMockReqResNext } = require("../../../helpers/express/expressTestHelper");

/* ==========================================================================
   Error Handler Middleware Unit Tests

   Tests centralized API error handling.

   Responsibilities
   - Test Multer upload error responses
   - Test Sequelize validation error responses
   - Test custom application error responses
   - Test unexpected server error responses
   - Test development and production logging
   - Test production stack trace protection

   Notes
   - Application logging is mocked.
   - The middleware sends the final HTTP error response directly.
=========================================================================== */

describe("error handler middleware", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = "test";
    });

    afterAll(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    /* =============================
       MULTER ERRORS
    ============================= */

    describe("Multer errors", () => {
        it("returns a clear message for file size errors", () => {
            const { req, res, next } = createMockReqResNext();

            const error = new multer.MulterError("LIMIT_FILE_SIZE");

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "File too large. Maximum size exceeded."
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("returns the Multer message for other upload errors", () => {
            const { req, res, next } = createMockReqResNext();

            const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE");

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unexpected field"
            });

            expect(next).not.toHaveBeenCalled();
        });
    });

    /* =============================
       SEQUELIZE ERRORS
    ============================= */

    describe("Sequelize errors", () => {
        it.each([
            "SequelizeValidationError",
            "SequelizeUniqueConstraintError"
        ])(
            "formats %s details", (errorName) => {
                const { req, res, next } = createMockReqResNext();

                const error = {
                    name: errorName,
                    errors: [{
                        path: "email",
                        message: "Email is invalid"
                    }, {
                        path: "name",
                        message: "Name is required"
                    }]
                };

                errorHandler(error, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);

                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: "Validation error",
                    errors: [{
                        field: "email",
                        message: "Email is invalid"
                    }, {
                        field: "name",
                        message: "Name is required"
                    }]
                });

                expect(next).not.toHaveBeenCalled();
            }
        );

        it("handles a Sequelize error without validation details", () => {
            const { req, res, next } = createMockReqResNext();

            const error = {
                name: "SequelizeValidationError"
            };

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Validation error"
            });

            expect(next).not.toHaveBeenCalled();
        });
    });

    /* =============================
       APPLICATION ERRORS
    ============================= */

    describe("Application errors", () => {
        it("uses the provided status code and message", () => {
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

            expect(next).not.toHaveBeenCalled();
        });

        it("includes structured application error details", () => {
            const { req, res, next } = createMockReqResNext();

            const error = new Error("Bad request");

            error.statusCode = 400;
            error.errors = [{
                field: "email",
                message: "Invalid email"
            }];

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Bad request",
                    errors: [{
                        field: "email",
                        message: "Invalid email"
                    }],
                    stack: expect.any(String)
                })
            );

            expect(next).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("defaults to status 500 when status code is missing", () => {
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

            expect(next).not.toHaveBeenCalled();
        });

        it("uses the fallback message when the error message is missing", () => {
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

            expect(next).not.toHaveBeenCalled();
        });
    });

    /* =============================
       ERROR LOGGING
    ============================= */

    describe("Error logging", () => {
        it("logs the complete error outside production", () => {
            const { req, res, next } = createMockReqResNext();

            const error = new Error("Development error");

            errorHandler(error, req, res, next);

            expect(logger.error).toHaveBeenCalledTimes(1);
            expect(logger.error).toHaveBeenCalledWith(
                {
                    error
                },
                "Error caught by error middleware"
            );
        });

        it("logs only the error message in production", () => {
            process.env.NODE_ENV = "production";

            const { req, res, next } = createMockReqResNext();

            const error = new Error("Production error");

            errorHandler(error, req, res, next);

            expect(logger.error).toHaveBeenCalledTimes(1);
            expect(logger.error).toHaveBeenCalledWith(
                {
                    message: "Production error"
                },
                "Error"
            );
        });
    });

    /* =============================
       PRODUCTION RESPONSES
    ============================= */

    describe("Production responses", () => {
        it("does not expose the stack trace in production", () => {
            process.env.NODE_ENV = "production";

            const { req, res, next } = createMockReqResNext();

            const error = new Error("Production error");

            errorHandler(error, req, res, next);

            const payload = res.json.mock.calls[0][0];

            expect(payload).toEqual({
                success: false,
                message: "Production error"
            });

            expect(payload).not.toHaveProperty("stack");
            expect(next).not.toHaveBeenCalled();
        });

        it("preserves structured errors without exposing the stack", () => {
            process.env.NODE_ENV = "production";

            const { req, res, next } = createMockReqResNext();

            const error = new Error("Validation failed");

            error.statusCode = 400;
            error.errors = [{
                field: "email",
                message: "Invalid email"
            }];

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Validation failed",
                errors: [{
                    field: "email",
                    message: "Invalid email"
                }]
            });
        });
    });
});
