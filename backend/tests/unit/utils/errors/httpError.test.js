/* ==================================================
   HTTP ERROR UTILITY TESTS

   Tests:
   - HTTP error creation
   - statusCode attachment
   - reusable HTTP error throwing

   Ensures:
   - custom application errors are standardized
   - status codes are preserved correctly
================================================== */

const { createHttpError, throwHttpError } = require("../../../../src/utils/errors/httpError");

describe("httpError utils", () => {

    /* =============================
       ERROR CREATION
    ============================= */

    it("should create HTTP error with message and statusCode", () => {
        const error = createHttpError(404, "User not found");

        expect(error).toBeInstanceOf(Error);

        expect(error.message).toBe("User not found");
        expect(error.statusCode).toBe(404);
    });

    /* =============================
       ERROR THROWING
    ============================= */

    it("should throw reusable HTTP error", () => {
        expect(() => {
            throwHttpError(403, "Forbidden");
        }).toThrow("Forbidden");

        try {
            throwHttpError(403, "Forbidden");
        } catch (error) {
            expect(error.statusCode).toBe(403);
        }
    });
});
