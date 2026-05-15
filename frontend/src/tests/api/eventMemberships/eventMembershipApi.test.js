import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "../../../api/apiClient";

import {
    getEventMembers,
    getEventStaff,
    joinEvent,
    leaveEvent,
    removeEventMember,
    transferEventOwnership,
    updateEventMemberRole
} from "../../../api/eventMemberships/eventMembershipApi";

/* ==================================================
   EVENT MEMBERSHIPS API TESTS
   Tests event membership API requests

   Handles:
   - join and leave requests
   - member and staff retrieval
   - member role updates
   - member removal
   - ownership transfer
================================================== */

vi.mock("../../../api/apiClient", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe("eventMembershipApi", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       JOIN / LEAVE EVENTS
    ============================= */

    it("should join an event", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.post.mockResolvedValue({
            data: mockPayload
        });

        const result = await joinEvent(1);

        expect(apiClient.post).toHaveBeenCalledWith("/events/1/members/join");

        expect(result).toEqual(mockPayload);
    });

    it("should leave an event", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.delete.mockResolvedValue({
            data: mockPayload
        });

        const result = await leaveEvent(1);

        expect(apiClient.delete).toHaveBeenCalledWith("/events/1/members/leave");

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       MEMBERS / STAFF
    ============================= */

    it("should fetch event members", async () => {
        const mockPayload = {
            success: true,
            members: []
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await getEventMembers(1);

        expect(apiClient.get).toHaveBeenCalledWith("/events/1/members");

        expect(result).toEqual(mockPayload);
    });

    it("should fetch event staff", async () => {
        const mockPayload = {
            success: true,
            eventStaff: []
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await getEventStaff(1);

        expect(apiClient.get).toHaveBeenCalledWith("/events/1/staff");

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       ROLE / OWNERSHIP MANAGEMENT
    ============================= */

    it("should update a member role", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.put.mockResolvedValue({
            data: mockPayload
        });

        const result = await updateEventMemberRole(1, 2, "co_organizer");

        expect(apiClient.put).toHaveBeenCalledWith(
            "/events/1/members/2/role",
            {
                newRole: "co_organizer"
            }
        );

        expect(result).toEqual(mockPayload);
    });

    it("should remove an event member", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.delete.mockResolvedValue({
            data: mockPayload
        });

        const result = await removeEventMember(1, 2);

        expect(apiClient.delete).toHaveBeenCalledWith("/events/1/members/2");

        expect(result).toEqual(mockPayload);
    });

    it("should transfer event ownership", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.put.mockResolvedValue({
            data: mockPayload
        });

        const result = await transferEventOwnership(1, 2);

        expect(apiClient.put).toHaveBeenCalledWith(
            "/events/1/ownership",
            {
                targetUserId: 2
            }
        );

        expect(result).toEqual(mockPayload);
    });
});
