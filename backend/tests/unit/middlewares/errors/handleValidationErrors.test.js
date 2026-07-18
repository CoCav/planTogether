/* =============================
   TEST MOCKS
============================= */

jest.mock("express-validator");

jest.mock("../../../../src/config/logger", () => ({
    warn: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */
const { validationResult } = require("express-validator");

const logger = require("../../../../src/config/logger");

const handleValidationErrors = require("../../../../src/middlewares/errors/handleValidationErrors");

const {
    createMockReqResNext,
    expectNoResponseSent
} = require("../../../helpers/express/expressTestHelper");

/* ==========================================================================
   Handle Validation Errors Middleware Unit Tests

   Tests express-validator error handling.

   Responsibilities
   - Test successful validation flow
   - Test validation error formatting
   - Test validation field fallback behavior
   - Test development validation logging
   - Test production validation logging

   Notes
   - express-validator results and application logging are mocked.
   - Formatted validation errors are forwarded to next().
=========================================================================== */

describe("handle validation errors middleware", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = "test";
    });

    afterAll(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    /* =============================
       VALIDATION SUCCESS
    ============================= */

    describe("Successful validation", () => {
        it("continues when no validation errors are present", () => {
            const { req, res, next } = createMockReqResNext();

            validationResult.mockReturnValue({
                isEmpty: () => true
            });

            handleValidationErrors(req, res, next);

            expect(validationResult).toHaveBeenCalledWith(req);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();

            expect(logger.warn).not.toHaveBeenCalled();

            expectNoResponseSent(res);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation error formatting", () => {
        it("forwards formatted validation errors", () => {
            const { req, res, next } = createMockReqResNext();

            const rawErrors = [{
                path: "email",
                msg: "Invalid email"
            }, {
                path: "password",
                msg: "Password is too short"
            }];

            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => rawErrors
            });

            handleValidationErrors(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 400,
                    message: "Validation failed",
                    errors: [{
                        field: "email",
                        message: "Invalid email"
                    }, {
                        field: "password",
                        message: "Password is too short"
                    }]
                })
            );

            expectNoResponseSent(res);
        });

        it.each([[
            "path",
            {
                path: "email",
                msg: "Invalid email"
            },
            "email"
        ], [
            "param fallback",
            {
                param: "username",
                msg: "Username is required"
            },
            "username"
        ]])(
            "uses the validation %s as the formatted field", (_, rawError, expectedField) => {
                const { req, res, next } = createMockReqResNext();

                validationResult.mockReturnValue({
                    isEmpty: () => false,
                    array: () => [rawError]
                });

                handleValidationErrors(req, res, next);

                expect(next).toHaveBeenCalledWith(
                    expect.objectContaining({
                        errors: [{
                            field: expectedField,
                            message: rawError.msg
                        }]
                    })
                );
            }
        );

        it("preserves the original validation error order", () => {
            const { req, res, next } = createMockReqResNext();

            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{
                    path: "name",
                    msg: "Name is required"
                }, {
                    path: "email",
                    msg: "Invalid email"
                }, {
                    path: "password",
                    msg: "Password is required"
                }]
            });

            handleValidationErrors(req, res, next);

            const forwardedError = next.mock.calls[0][0];

            expect(forwardedError.errors).toEqual([{
                field: "name",
                message: "Name is required"
            }, {
                field: "email",
                message: "Invalid email"
            }, {
                field: "password",
                message: "Password is required"
            }]);
        });
    });

    /* =============================
       VALIDATION LOGGING
    ============================= */

    describe("Validation logging", () => {
        it("logs raw validation errors outside production", () => {
            const { req, res, next } = createMockReqResNext();

            const rawErrors = [{
                path: "email",
                msg: "Invalid email"
            }];

            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => rawErrors
            });

            handleValidationErrors(req, res, next);

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn).toHaveBeenCalledWith(
                {
                    errors: rawErrors
                },
                "Validation errors"
            );
        });

        it("does not log validation details in production", () => {
            process.env.NODE_ENV = "production";

            const { req, res, next } = createMockReqResNext();

            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [
                    {
                        path: "email",
                        msg: "Invalid email"
                    }
                ]
            });

            handleValidationErrors(req, res, next);

            expect(logger.warn).not.toHaveBeenCalled();

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 400,
                    message: "Validation failed"
                })
            );
        });
    });
});
