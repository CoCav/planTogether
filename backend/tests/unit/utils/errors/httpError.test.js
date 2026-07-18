const {
    createHttpError,
    throwHttpError
} = require("../../../../src/utils/errors/httpError");

/* ==========================================================================
   HTTP Error Utility Unit Tests

   Tests reusable HTTP error utilities.

   Responsibilities
   - Test HTTP error creation
   - Test status code attachment
   - Test direct HTTP error throwing
   - Test thrown error shape

   Notes
   - Errors are designed for the global error handler middleware.
=========================================================================== */

describe("HTTP error utility", () => {

    /* =============================
       ERROR CREATION
    ============================= */

    describe("createHttpError", () => {
        it("creates an Error with the provided message and status code", () => {
            const error = createHttpError(404, "User not found");

            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe("User not found");
            expect(error.statusCode).toBe(404);
        });

        it("preserves the provided error values", () => {
            const error = createHttpError(422, "Validation failed");

            expect(error).toMatchObject({
                message: "Validation failed",
                statusCode: 422
            });
        });
    });

    /* =============================
       ERROR THROWING
    ============================= */

    describe("throwHttpError", () => {
        it("throws an HTTP error with the provided message", () => {
            expect(() => {
                throwHttpError(403, "Forbidden");
            }).toThrow("Forbidden");
        });

        it("throws an Error with the provided status code", () => {
            try {
                throwHttpError(403, "Forbidden");

                throw new Error("Expected throwHttpError to throw");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe("Forbidden");
                expect(error.statusCode).toBe(403);
            }
        });
    });
});
