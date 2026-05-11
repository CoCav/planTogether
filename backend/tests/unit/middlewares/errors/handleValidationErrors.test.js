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

const { validationResult } = require("express-validator");

const handleValidationErrors = require("../../../../src/middlewares/errors/handleValidationErrors");

const { createMockReqResNext } = require("../../../helpers/express/mockExpress");
const { mockConsoleLog } = require("../../../helpers/mocks/consoleMocks");

jest.mock("express-validator");

describe("handleValidationErrors middleware", () => {

    const originalEnv = process.env.NODE_ENV;

    mockConsoleLog();

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

        expect(next).toHaveBeenCalledWith({
            statusCode: 400,
            success: false,
            message: "Validation failed",
            errors: [
                { field: "email", message: "Invalid email" },
                { field: "password", message: "Too short" }
            ]
        });
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

        expect(console.log).toHaveBeenCalledWith(
            "Validation errors:",
            [{ path: "email", msg: "Invalid email" }]
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

        expect(console.log).not.toHaveBeenCalled();
    });
});
