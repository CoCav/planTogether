/* ==================================================
   HANDLE VALIDATION ERRORS MIDDLEWARE TESTS

   Tests:
   - successful validation flow
   - formatted validation errors
   - non-production validation logging
   - production logging behavior
   - fallback field formatting

   Ensures:
   - next() is called when validation succeeds
   - validation errors are forwarded consistently
   - production does not log validation details
================================================== */

jest.mock("express-validator");

jest.mock("../../../../src/config/logger", () => ({
    warn: jest.fn()
}));

const { validationResult } = require("express-validator");

const logger = require("../../../../src/config/logger");

const handleValidationErrors = require("../../../../src/middlewares/errors/handleValidationErrors");

const { createMockReqResNext } = require("../../../helpers/express/expressTestHelper");

describe("handleValidationErrors middleware", () => {

    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = "test";
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    /* =============================
       VALIDATION SUCCESS
    ============================= */

    it("should call next when there are no validation errors", () => {
        const { req, res, next } = createMockReqResNext();

        validationResult.mockReturnValue({
            isEmpty: () => true
        });

        handleValidationErrors(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should forward formatted errors to next when validation fails", () => {
        const { req, res, next } = createMockReqResNext();

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [
                { path: "email", msg: "Invalid email" },
                { param: "password", msg: "Too short" }
            ]
        });

        handleValidationErrors(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 400,
            message: "Validation failed",
            errors: [
                { field: "email", message: "Invalid email" },
                { field: "password", message: "Too short" }
            ]
        }));
    });

    it("should fallback to param when path is missing", () => {
        const { req, res, next } = createMockReqResNext();

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [
                { param: "username", msg: "Required" }
            ]
        });

        handleValidationErrors(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: [
                    { field: "username", message: "Required" }
                ]
            })
        );
    });

    /* =============================
       LOGGING BEHAVIOR
    ============================= */

    it("should log validation errors when not in production", () => {
        const { req, res, next } = createMockReqResNext();

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [
                { path: "email", msg: "Invalid email" }
            ]
        });

        handleValidationErrors(req, res, next);

        expect(logger.warn).toHaveBeenCalledWith({
            errors: [{ path: "email", msg: "Invalid email" }]
        },
            "Validation errors"
        );
    });

    it("should not log validation errors in production", () => {
        process.env.NODE_ENV = "production";

        const { req, res, next } = createMockReqResNext();

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [
                { path: "email", msg: "Invalid email" }
            ]
        });

        handleValidationErrors(req, res, next);

        expect(logger.warn).not.toHaveBeenCalled();
    });
});
