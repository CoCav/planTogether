import { describe, expect, it } from "vitest";

import { ApiError, getApiErrorMessage, normalizeApiError } from "../../api/apiError";

import { createMockApiError, createMockNetworkError } from "../helpers/mocks/mockApiError";

/* ==================================================
   API ERROR TESTS
   Tests normalized API error helpers

   Handles:
   - custom ApiError shape
   - Axios error normalization
   - HTTP status extraction
   - validation errors extraction
   - default fallback message handling
   - custom fallback message handling

   Notes:
   - uses reusable API error mock helpers
================================================== */

describe("apiError", () => {

    /* =============================
       API ERROR CLASS
    ============================= */

    it("should create an ApiError with default metadata", () => {
        const error = new ApiError("Something failed");

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("ApiError");
        expect(error.message).toBe("Something failed");
        expect(error.status).toBeNull();
        expect(error.errors).toEqual([]);
        expect(error.cause).toBeNull();
    });

    it("should create an ApiError with custom metadata", () => {
        const cause = new Error("Original error");

        const error = new ApiError("Validation failed", {
            status: 400,
            errors: [
                {
                    field: "email",
                    message: "Invalid email"
                }
            ],
            cause
        });

        expect(error.status).toBe(400);

        expect(error.errors).toEqual([
            {
                field: "email",
                message: "Invalid email"
            }
        ]);

        expect(error.cause).toBe(cause);
    });

    /* =============================
       ERROR NORMALIZATION
    ============================= */

    it("should normalize an Axios error with backend message and errors", () => {
        const axiosError = createMockApiError({
            status: 400,
            message: "Validation failed",
            errors: [
                {
                    field: "name",
                    message: "Name is required"
                }
            ]
        });

        const normalizedError = normalizeApiError(axiosError);

        expect(normalizedError).toBeInstanceOf(ApiError);
        expect(normalizedError.message).toBe("Validation failed");
        expect(normalizedError.status).toBe(400);

        expect(normalizedError.errors).toEqual([
            {
                field: "name",
                message: "Name is required"
            }
        ]);

        expect(normalizedError.cause).toBe(axiosError);
    });

    it("should fallback to Axios error message when backend message is missing", () => {
        const axiosError = createMockNetworkError("Network Error");

        expect(normalizeApiError(axiosError).message).toBe("Network Error");
    });

    it("should use default message when no message is available", () => {
        expect(normalizeApiError({}).message).toBe("Something went wrong.");
    });

    it("should ignore non-array validation errors", () => {
        const axiosError = {
            response: {
                status: 500,
                data: {
                    message: "Server error",
                    errors: "not-an-array"
                }
            }
        };

        expect(normalizeApiError(axiosError).errors).toEqual([]);
    });

    /* =============================
       READABLE MESSAGE
    ============================= */

    it("should return a readable API error message", () => {
        const axiosError = createMockApiError({
            message: "Email already in use"
        });

        expect(getApiErrorMessage(axiosError)).toBe("Email already in use");
    });

    it("should return custom fallback message when no message is available", () => {
        expect(getApiErrorMessage({}, "Fallback error")).toBe("Fallback error");
    });
});
