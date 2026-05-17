import { describe, expect, it } from "vitest";

import {
    getNormalizedMyEvents,
    normalizeMyEventItem,
    normalizeMyEvents,
    normalizePaginatedMyEvents
} from "../../../../features/users/authenticated/myEventNormalizer";

import { EVENT_ROLES } from "../../../../features/shared/eventRoles";
import { EVENT_STATUS } from "../../../../features/shared/eventStatus";

import { createEvent } from "../../../factories/events/eventFactory";

import {
    createDirectMyEventItem,
    createMyEventItem,
    createMyEventItemWithEventAlias,
    createMyEventList,
    createPaginatedMyEventsPayload
} from "../../../factories/users/authenticated/myEventFactory";

/* ==================================================
   MY EVENT NORMALIZER TESTS
   Tests current user event payload normalization

   Handles:
   - current user event item normalization
   - membership role enrichment
   - current user event list normalization
   - paginated current user event payloads
   - API payload extraction

   Notes:
   - uses reusable current user event factories
================================================== */

describe("myEventNormalizer", () => {

    /* =============================
       CURRENT USER EVENT ITEMS
    ============================= */

    it("should normalize current user event item from event alias", () => {
        const item = normalizeMyEventItem(
            createMyEventItem({
                id: 10,
                role: EVENT_ROLES.ORGANIZER,
                createdAt: "2026-01-01T10:00:00.000Z",
                updatedAt: "2026-01-02T10:00:00.000Z",
                event: createEvent({
                    id: 1,
                    title: "Created Event",
                    status: EVENT_STATUS.UPCOMING,
                    participantCount: "2"
                })
            })
        );

        expect(item).toMatchObject({
            id: 1,
            title: "Created Event",
            status: EVENT_STATUS.UPCOMING,
            participantCount: 2,
            role: EVENT_ROLES.ORGANIZER,
            membershipId: 10,
            membershipCreatedAt: "2026-01-01T10:00:00.000Z",
            membershipUpdatedAt: "2026-01-02T10:00:00.000Z"
        });
    });

    it("should normalize current user event item from Event alias", () => {
        const item = normalizeMyEventItem(
            createMyEventItemWithEventAlias({
                id: 11,
                role: EVENT_ROLES.PARTICIPANT,
                Event: createEvent({
                    id: 2,
                    title: "Joined Event"
                })
            })
        );

        expect(item).toMatchObject({
            id: 2,
            title: "Joined Event",
            role: EVENT_ROLES.PARTICIPANT,
            membershipId: 11
        });
    });

    it("should normalize direct event item when no membership wrapper exists", () => {
        const item = normalizeMyEventItem(
            createDirectMyEventItem({
                id: 3,
                title: "Direct Event"
            })
        );

        expect(item).toMatchObject({
            id: 3,
            title: "Direct Event",
            role: null,
            membershipId: 3
        });
    });

    /* =============================
       CURRENT USER EVENT LISTS
    ============================= */

    it("should normalize current user event items", () => {
        const events = normalizeMyEvents(
            createMyEventList([
                createMyEventItem({
                    id: 10,
                    role: EVENT_ROLES.ORGANIZER,
                    event: createEvent({
                        id: 1,
                        title: "Created Event"
                    })
                }),

                createMyEventItem({
                    id: 11,
                    role: EVENT_ROLES.PARTICIPANT,
                    event: createEvent({
                        id: 2,
                        title: "Joined Event"
                    })
                })
            ])
        );

        expect(events).toHaveLength(2);

        expect(events[0].title).toBe("Created Event");
        expect(events[1].title).toBe("Joined Event");
    });

    it("should return empty array when current user event data is invalid", () => {
        expect(normalizeMyEvents(null)).toEqual([]);

        expect(normalizeMyEvents({})).toEqual([]);
    });

    /* =============================
       PAGINATED CURRENT USER EVENTS
    ============================= */

    it("should normalize paginated current user event payload", () => {
        const result = normalizePaginatedMyEvents(
            createPaginatedMyEventsPayload({
                events: [
                    createMyEventItem({
                        id: 10,
                        role: EVENT_ROLES.ORGANIZER,
                        event: createEvent({
                            id: 1,
                            title: "Created Event"
                        })
                    })
                ],
                page: 2,
                pageSize: 5,
                totalEvents: 12,
                totalPages: 3,
                message: "Events retrieved",
                success: true
            })
        );

        expect(result).toEqual({
            events: [
                expect.objectContaining({
                    id: 1,
                    title: "Created Event",
                    role: EVENT_ROLES.ORGANIZER
                })
            ],
            page: 2,
            pageSize: 5,
            totalEvents: 12,
            totalPages: 3,
            message: "Events retrieved",
            success: true
        });
    });

    it("should return fallback pagination values", () => {
        expect(normalizePaginatedMyEvents()).toMatchObject({
            events: [],
            page: 1,
            pageSize: 10,
            totalEvents: 0,
            totalPages: 1,
            message: "",
            success: false
        });
    });

    /* =============================
       API PAYLOAD EXTRACTION
    ============================= */

    it("should extract and normalize current user events from API payload", () => {
        const payload = {
            data: {
                events: [
                    createMyEventItem({
                        id: 10,
                        role: EVENT_ROLES.PARTICIPANT,
                        event: createEvent({
                            id: 1,
                            title: "Joined Event"
                        })
                    })
                ]
            }
        };

        const events = getNormalizedMyEvents(payload);

        expect(events).toEqual([
            expect.objectContaining({
                id: 1,
                title: "Joined Event",
                role: EVENT_ROLES.PARTICIPANT
            })
        ]);
    });
});
