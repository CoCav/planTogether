import { describe, expect, it } from "vitest";

import {
    getNormalizedPublicUserEvents,
    normalizePaginatedPublicUserEvents,
    normalizePublicUserEvents
} from "../../../../features/users/public/publicUserEventNormalizer";

import { EVENT_STATUS } from "../../../../features/shared/constants/eventStatus";

import { createEvent } from "../../../factories/events/eventFactory";

/* ==================================================
   PUBLIC USER EVENT NORMALIZER TESTS
   Tests public user event payload normalization

   Handles:
   - public user event item normalization
   - invalid public user event list fallback
   - paginated public user event payload normalization
   - public user event listing metadata
   - shared pagination metadata normalization
   - API payload extraction
   - fallback values

   Notes:
   - uses reusable event test factories
   - aligned with GET /users/:id/events
================================================== */

describe("publicUserEventNormalizer", () => {

    /* =============================
       PUBLIC USER EVENTS
    ============================= */

    it("should normalize public user event items", () => {
        const result = normalizePublicUserEvents([
            createEvent({
                id: 1,
                title: "Joined Event",
                status: EVENT_STATUS.UPCOMING
            })
        ]);

        expect(result).toEqual([
            expect.objectContaining({
                id: 1,
                title: "Joined Event",
                status: EVENT_STATUS.UPCOMING
            })
        ]);
    });

    it("should return empty array when public user event items are invalid", () => {
        expect(normalizePublicUserEvents()).toEqual([]);
        expect(normalizePublicUserEvents(null)).toEqual([]);
        expect(normalizePublicUserEvents({})).toEqual([]);
    });

    /* =============================
       PAGINATED PUBLIC USER EVENTS
    ============================= */

    it("should normalize paginated public user event payload", () => {
        const result = normalizePaginatedPublicUserEvents({
            view: "joined",
            page: 2,
            pageSize: 4,
            totalEvents: 5,
            totalPages: 2,
            events: [
                createEvent({
                    id: 1,
                    title: "Joined Event",
                    status: EVENT_STATUS.UPCOMING
                })
            ],
            message: "Public user events retrieved",
            success: true
        });

        expect(result).toEqual({
            view: "joined",
            page: 2,
            pageSize: 4,
            totalEvents: 5,
            totalPages: 2,
            events: [
                expect.objectContaining({
                    id: 1,
                    title: "Joined Event",
                    status: EVENT_STATUS.UPCOMING
                })
            ],
            message: "Public user events retrieved",
            success: true
        });
    });

    it("should return fallback pagination values", () => {
        expect(normalizePaginatedPublicUserEvents()).toEqual({
            view: "created",
            page: 1,
            pageSize: 4,
            totalEvents: 0,
            totalPages: 1,
            events: [],
            message: "",
            success: false
        });
    });

    it("should convert pagination metadata to numbers", () => {
        const result = normalizePaginatedPublicUserEvents({
            page: "2",
            pageSize: "8",
            totalEvents: "12",
            totalPages: "3",
            events: []
        });

        expect(result).toEqual(
            expect.objectContaining({
                page: 2,
                pageSize: 8,
                totalEvents: 12,
                totalPages: 3
            })
        );
    });

    it("should normalize paginated public user event payload with totalItems fallback", () => {
        const result = normalizePaginatedPublicUserEvents({
            events: [],
            page: 1,
            pageSize: 4,
            totalItems: 11,
            totalPages: 3
        });

        expect(result).toMatchObject({
            page: 1,
            pageSize: 4,
            totalEvents: 11,
            totalPages: 3
        });
    });

    /* =============================
       API PAYLOAD NORMALIZATION
    ============================= */

    it("should normalize public user events from API payload", () => {
        const payload = {
            view: "created",
            page: 1,
            pageSize: 4,
            totalEvents: 1,
            totalPages: 1,
            events: [
                createEvent({
                    id: 1,
                    title: "Created Event"
                })
            ],
            message: "Public user events retrieved",
            success: true
        };

        const result = getNormalizedPublicUserEvents(payload);

        expect(result).toEqual({
            view: "created",
            page: 1,
            pageSize: 4,
            totalEvents: 1,
            totalPages: 1,
            events: [
                expect.objectContaining({
                    id: 1,
                    title: "Created Event"
                })
            ],
            message: "Public user events retrieved",
            success: true
        });
    });
});
