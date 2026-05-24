import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createEvent,
    deleteEvent,
    getAllEvents,
    getCurrentUserEventAccess,
    getEventById,
    updateEvent
} from "../../../api/events/eventApi";

import apiClient from "../../../api/apiClient";

import { EVENT_ROLES } from "../../../features/shared/constants/eventRoles";
import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

import { createEvent as createEventData } from "../../factories/events/eventFactory";

/* ==================================================
   EVENT API TESTS
   Tests event API requests

   Handles:
   - event listing requests
   - current user event access requests
   - single event retrieval
   - event creation
   - event updates
   - event deletion

   Notes:
   - uses reusable event test factories
   - API helpers return unwrapped backend payloads
================================================== */

vi.mock("../../../api/apiClient", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe("eventApi", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       READ EVENTS
    ============================= */

    it("should fetch all events with query params", async () => {
        const mockPayload = {
            success: true,
            events: []
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const params = {
            page: 1,
            search: "React"
        };

        const result = await getAllEvents(params);

        expect(apiClient.get).toHaveBeenCalledWith("/events", { params });

        expect(result).toEqual(mockPayload);
    });

    it("should fetch current user event access by event ID", async () => {
        const mockPayload = {
            success: true,
            role: EVENT_ROLES.ORGANIZER,
            status: EVENT_STATUS.UPCOMING,
            canEdit: true,
            canDelete: true
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await getCurrentUserEventAccess(1);

        expect(apiClient.get).toHaveBeenCalledWith("/events/1/me");

        expect(result).toEqual(mockPayload);
    });

    it("should fetch one event by ID", async () => {
        const mockPayload = {
            success: true,
            event: createEventData({
                id: 1,
                title: "React Meetup"
            })
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await getEventById(1);

        expect(apiClient.get).toHaveBeenCalledWith("/events/1");

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       WRITE EVENTS
    ============================= */

    it("should create an event", async () => {
        const mockPayload = {
            success: true,
            event: createEventData({
                id: 1
            })
        };

        apiClient.post.mockResolvedValue({
            data: mockPayload
        });

        const eventData = {
            title: "React Meetup"
        };

        const result = await createEvent(eventData);

        expect(apiClient.post).toHaveBeenCalledWith("/events", eventData);

        expect(result).toEqual(mockPayload);
    });

    it("should update an event", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.put.mockResolvedValue({
            data: mockPayload
        });

        const eventData = {
            title: "Updated Event"
        };

        const result = await updateEvent(1, eventData);

        expect(apiClient.put).toHaveBeenCalledWith("/events/1", eventData);

        expect(result).toEqual(mockPayload);
    });

    it("should delete an event", async () => {
        const mockPayload = {
            success: true
        };

        apiClient.delete.mockResolvedValue({
            data: mockPayload
        });

        const result = await deleteEvent(1);

        expect(apiClient.delete).toHaveBeenCalledWith("/events/1");

        expect(result).toEqual(mockPayload);
    });
});
