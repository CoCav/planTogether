import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginUser, logoutUser, registerUser } from "../../../api/auth/authApi";

import apiClient from "../../../api/apiClient";

/* ==================================================
   AUTH API TESTS
   Tests authentication API requests

   Handles:
   - register requests
   - login requests
   - logout requests
   - unwrapped API responses
================================================== */

vi.mock("../../../api/apiClient", () => ({
    default: {
        post: vi.fn()
    }
}));

describe("authApi", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       REGISTER
    ============================= */

    it("should register a user", async () => {
        const mockPayload = {
            success: true,
            user: {
                id: 1,
                name: "John Doe"
            }
        };

        apiClient.post.mockResolvedValue({
            data: mockPayload
        });

        const userData = {
            name: "John Doe",
            email: "john@test.com",
            password: "Password123"
        };

        const result = await registerUser(userData);

        expect(apiClient.post).toHaveBeenCalledWith("/auth/register", userData);

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       LOGIN
    ============================= */

    it("should login a user", async () => {
        const mockPayload = {
            success: true,
            token: "fake-token"
        };

        apiClient.post.mockResolvedValue({
            data: mockPayload
        });

        const credentials = {
            email: "john@test.com",
            password: "Password123"
        };

        const result = await loginUser(credentials);

        expect(apiClient.post).toHaveBeenCalledWith("/auth/login", credentials);

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       LOGOUT
    ============================= */

    it("should logout the current user", async () => {
        const mockPayload = {
            success: true,
            message: "Logged out successfully"
        };

        apiClient.post.mockResolvedValue({
            data: mockPayload
        });

        const result = await logoutUser();

        expect(apiClient.post).toHaveBeenCalledWith("/auth/logout");

        expect(result).toEqual(mockPayload);
    });
});
