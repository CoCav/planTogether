import { describe, expect, it } from "vitest";

import {
    getNormalizedPublicUserEvents,
    normalizePublicUserEvents
} from "../../../../features/users/public/publicUserEventNormalizer";

import { EVENT_STATUS } from "../../../../features/shared/constants/eventStatus";

import { createEvent } from "../../../factories/events/eventFactory";

/* ==================================================
   PUBLIC USER EVENT NORMALIZER TESTS
   Tests public user event payload normalization

   Handles:
   - paginated public user events
   - public user event listing metadata
   - normalized event lists
   - fallback values

   Notes:
   - uses reusable event test factories
   - aligned with GET /users/:id/events
================================================== */

describe("publicUserEventNormalizer", () => {

    /* =============================
       PUBLIC USER EVENTS
    ============================= */

    it("should normalize paginated public user event payload", () => {
        const result = normalizePublicUserEvents({
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

    it("should return fallback values when payload is empty", () => {
        expect(normalizePublicUserEvents()).toEqual({
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
        const result = normalizePublicUserEvents({
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
