const validateRequest = require("../../src/middlewares/validateRequest");
const { validationResult } = require("express-validator");

jest.mock("express-validator");

const createMocks = () => {
    const req = {};

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

describe("validateRequest middleware", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = "test";
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    it("should call next when there are no validation errors", () => {
        const { req, res, next } = createMocks();

        validationResult.mockReturnValue({
            isEmpty: () => true
        });

        validateRequest(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it("should forward formatted errors to next when validation fails", () => {
        const { req, res, next } = createMocks();

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [
                { path: "email", msg: "Invalid email" },
                { param: "password", msg: "Too short" }
            ]
        });

        validateRequest(req, res, next);

        expect(next).toHaveBeenCalledWith({
            statusCode: 400,
            message: "Validation failed",
            errors: [
                { field: "email", message: "Invalid email" },
                { field: "password", message: "Too short" }
            ]
        });
    });

    it("should log validation errors when not in production", () => {
        const { req, res, next } = createMocks();

        jest.spyOn(console, "log").mockImplementation(() => {});

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ path: "email", msg: "Invalid email" }]
        });

        validateRequest(req, res, next);

        expect(console.log).toHaveBeenCalledWith(
            "Validation errors:",
            [{ path: "email", msg: "Invalid email" }]
        );

        console.log.mockRestore();
    });

    it("should NOT log validation errors in production", () => {
        process.env.NODE_ENV = "production";

        const { req, res, next } = createMocks();

        jest.spyOn(console, "log").mockImplementation(() => {});

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ path: "email", msg: "Invalid email" }]
        });

        validateRequest(req, res, next);

        expect(console.log).not.toHaveBeenCalled();

        console.log.mockRestore();
    });

    it("should fallback to param when path is missing", () => {
        const { req, res, next } = createMocks();

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [
                { param: "username", msg: "Required" }
            ]
        });

        validateRequest(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: [{ field: "username", message: "Required" }]
            })
        );
    });
});