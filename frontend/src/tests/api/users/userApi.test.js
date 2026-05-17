import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "../../../api/apiClient";

import {
    changeCurrentUserPassword,
    deleteCurrentUserAccount,
    getCurrentUserEvents,
    getCurrentUserProfile,
    getPublicUserEvents,
    getPublicUserProfile,
    updateCurrentUserProfile
} from "../../../api/users/userApi";

import { createEvent } from "../../factories/events/eventFactory";

import { createAuthenticatedUser, createPublicUser } from "../../factories/users/userFactory";

/* ==================================================
   USER API TESTS
   Tests authenticated and public user API requests

   Handles:
   - authenticated profile requests
   - authenticated password updates
   - authenticated account deletion
   - current user event retrieval
   - public user profile retrieval
   - public user event retrieval

   Notes:
   - uses reusable user and event test factories
================================================== */

vi.mock("../../../api/apiClient", () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe("userApi", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       AUTHENTICATED USER
    ============================= */

    it("should fetch current user profile", async () => {
        const mockPayload = {
            success: true,
            user: createAuthenticatedUser({
                userId: 1,
                name: "John Doe"
            })
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await getCurrentUserProfile();

        expect(apiClient.get).toHaveBeenCalledWith("/users/me");

        expect(result).toEqual(mockPayload);
    });

    it("should update current user profile", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.put.mockResolvedValue({
            data: mockPayload
        });

        const profileData = {
            name: "John Doe"
        };

        const result = await updateCurrentUserProfile(profileData);

        expect(apiClient.put).toHaveBeenCalledWith("/users/me", profileData);

        expect(result).toEqual(mockPayload);
    });

    it("should update current user password", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.put.mockResolvedValue({
            data: mockPayload
        });

        const passwordData = {
            currentPassword: "OldPassword123",
            newPassword: "NewPassword123"
        };

        const result = await changeCurrentUserPassword(passwordData);

        expect(apiClient.put).toHaveBeenCalledWith("/users/me/password", passwordData);

        expect(result).toEqual(mockPayload);
    });

    it("should delete current user account", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.delete.mockResolvedValue({
            data: mockPayload
        });

        const result = await deleteCurrentUserAccount();

        expect(apiClient.delete).toHaveBeenCalledWith("/users/me");

        expect(result).toEqual(mockPayload);
    });

    it("should fetch current user events with query params", async () => {
        const mockPayload = {
            success: true,
            events: [
                createEvent()
            ]
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const params = {
            page: 1,
            view: "created"
        };

        const result = await getCurrentUserEvents(params);

        expect(apiClient.get).toHaveBeenCalledWith("/users/me/events", { params });

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       PUBLIC USER
    ============================= */

    it("should fetch a public user profile", async () => {
        const mockPayload = {
            success: true,
            user: createPublicUser({
                name: "Jane Doe"
            })
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await getPublicUserProfile(2);

        expect(apiClient.get).toHaveBeenCalledWith("/users/2");

        expect(result).toEqual(mockPayload);
    });

    it("should fetch public user events", async () => {
        const mockPayload = {
            success: true,
            createdEvents: [
                createEvent()
            ],
            joinedEvents: [
                createEvent({
                    id: 2,
                    title: "Joined Event"
                })
            ]
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const params = {
            page: 1
        };

        const result = await getPublicUserEvents(2, params);

        expect(apiClient.get).toHaveBeenCalledWith("/users/2/events", { params });

        expect(result).toEqual(mockPayload);
    });
});
