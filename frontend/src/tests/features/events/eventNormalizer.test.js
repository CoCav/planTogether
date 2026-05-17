import { describe, expect, it } from "vitest";

import {
    getNormalizedEvent,
    getNormalizedEvents,
    normalizeEvent,
    normalizeEvents,
    normalizePaginatedEvents
} from "../../../features/events/eventNormalizer";

import { EVENT_MODES } from "../../../features/shared/eventModes";
import { EVENT_STATUS } from "../../../features/shared/eventStatus";

import {
    createEvent,
    createPaginatedEventsPayload
} from "../../factories/events/eventFactory";

/* ==================================================
   EVENT NORMALIZER TESTS
   Tests public event payload normalization

   Handles:
   - single event normalization
   - event list normalization
   - paginated event payload normalization
   - API payload extraction
   - fallback values

   Notes:
   - uses reusable event test factories
================================================== */

describe("eventNormalizer", () => {

    /* =============================
       SINGLE EVENT
    ============================= */

    it("should normalize a single event with default values", () => {
        const event = normalizeEvent({
            id: 1,
            title: "Test Event"
        });

        expect(event).toMatchObject({
            id: 1,
            title: "Test Event",
            description: "",
            theme: "",
            type: "",
            mode: EVENT_MODES.IN_PERSON,
            location: "",
            startDateTime: null,
            endDateTime: null,
            creatorId: null,
            creatorName: "",
            image: null,
            maxParticipants: null,
            registrationDeadline: null,
            participantCount: 0,
            status: EVENT_STATUS.UPCOMING,
            createdAt: null,
            updatedAt: null
        });
    });

    it("should normalize creator name from nested creator or fallback creatorName", () => {
        expect(
            normalizeEvent({
                creator: {
                    name: "John Doe"
                }
            }).creatorName
        ).toBe("John Doe");

        expect(
            normalizeEvent({
                creatorName: "Jane Doe"
            }).creatorName
        ).toBe("Jane Doe");
    });

    it("should normalize numeric event values", () => {
        const event = normalizeEvent(
            createEvent({
                participantCount: "3",
                maxParticipants: "10"
            })
        );

        expect(event.participantCount).toBe(3);

        expect(event.maxParticipants).toBe(10);
    });

    it("should keep maxParticipants as null when missing", () => {
        expect(
            normalizeEvent({}).maxParticipants
        ).toBeNull();
    });

    it("should preserve optional event metadata", () => {
        const event = normalizeEvent(
            createEvent({
                image: "/uploads/events/event.png",
                registrationDeadline: "2026-12-19T12:00:00.000Z",
                createdAt: "2026-01-01T10:00:00.000Z",
                updatedAt: "2026-01-02T10:00:00.000Z"
            })
        );

        expect(event).toMatchObject({
            image: "/uploads/events/event.png",
            registrationDeadline: "2026-12-19T12:00:00.000Z",
            createdAt: "2026-01-01T10:00:00.000Z",
            updatedAt: "2026-01-02T10:00:00.000Z"
        });
    });

    /* =============================
       EVENT LISTS
    ============================= */

    it("should normalize an array of events", () => {
        const events = normalizeEvents([
            createEvent({
                id: 1,
                title: "Event 1"
            }),
            createEvent({
                id: 2,
                title: "Event 2"
            })
        ]);

        expect(events).toHaveLength(2);

        expect(events[0].title).toBe("Event 1");
        expect(events[1].title).toBe("Event 2");
    });

    it("should return empty array when normalizeEvents receives invalid data", () => {
        expect(normalizeEvents(null)).toEqual([]);

        expect(normalizeEvents({})).toEqual([]);
    });

    /* =============================
       PAGINATED EVENTS
    ============================= */

    it("should normalize paginated event payload", () => {
        const result = normalizePaginatedEvents(
            createPaginatedEventsPayload({
                events: [
                    createEvent({
                        id: 1,
                        title: "Event 1"
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
                    title: "Event 1"
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
        expect(normalizePaginatedEvents()).toMatchObject({
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

    it("should extract and normalize events from API payload", () => {
        const payload = {
            data: {
                events: [
                    createEvent({
                        id: 1,
                        title: "Event 1",
                        image: "/uploads/events/event.png"
                    })
                ]
            }
        };

        const events = getNormalizedEvents(payload);

        expect(events).toHaveLength(1);

        expect(events[0]).toMatchObject({
            id: 1,
            title: "Event 1",
            image: "/uploads/events/event.png"
        });
    });

    it("should extract and normalize one event from API payload", () => {
        const payload = {
            data: {
                event: createEvent({
                    id: 1,
                    title: "Single Event"
                })
            }
        };

        const event = getNormalizedEvent(payload);

        expect(event).toMatchObject({
            id: 1,
            title: "Single Event"
        });
    });
});
