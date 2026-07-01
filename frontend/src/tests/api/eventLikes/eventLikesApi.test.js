import { beforeEach, describe, expect, it, vi } from "vitest";

import { likeEvent, unlikeEvent } from "../../../api/eventLikes/eventLikesApi";

import apiClient from "../../../api/apiClient";

/* ==================================================
   EVENT LIKE API TESTS
   Tests event like API requests

   Handles:
   - event like requests
   - event unlike requests
   - unwrapped like response payloads

   Notes:
   - like and unlike actions require authentication
   - API helpers return unwrapped backend payloads
================================================== */

vi.mock("../../../api/apiClient", () => ({
    default: {
        post: vi.fn(),
        delete: vi.fn()
    }
}));

describe("eventLikesApi", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       WRITE LIKES
    ============================= */

    it("should like an event", async () => {
        const mockPayload = {
            success: true,
            message: "Event liked successfully",
            eventId: 1,
            userId: 10,
            liked: true,
            likesCount: 3
        };

        apiClient.post.mockResolvedValue({
            data: mockPayload
        });

        const result = await likeEvent(1);

        expect(apiClient.post).toHaveBeenCalledWith("/events/1/likes");

        expect(result).toEqual(mockPayload);
    });

    it("should unlike an event", async () => {
        const mockPayload = {
            success: true,
            message: "Event unliked successfully",
            eventId: 1,
            userId: 10,
            liked: false,
            likesCount: 2
        };

        apiClient.delete.mockResolvedValue({
            data: mockPayload
        });

        const result = await unlikeEvent(1);

        expect(apiClient.delete).toHaveBeenCalledWith("/events/1/likes");

        expect(result).toEqual(mockPayload);
    });
});
