import { describe, expect, it } from "vitest";

import {
    getNormalizedEvent,
    getNormalizedEvents,
    normalizeEvent,
    normalizeEvents,
    normalizePaginatedEvents
} from "../../../features/events/eventNormalizer";

import { EVENT_MODES } from "../../../features/shared/constants/eventModes";
import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

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
   - structured location normalization
   - paginated event payload normalization
   - fallback values
   - participant count normalization
   - review stats normalization
   - like count normalization
   - current user like state normalization

   Notes:
   - uses reusable event test factories
   - review stats are normalized for event cards and details pages
   - shared pagination metadata normalization
   - like metadata is normalized for event cards and details pages
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
            locationLabel: "",
            streetAddress: "",
            city: "",
            region: "",
            postalCode: "",
            country: "",
            latitude: null,
            longitude: null,

            startDateTime: null,
            endDateTime: null,

            creatorId: null,
            creatorName: "",

            image: null,
            maxParticipants: null,
            registrationDeadline: null,
            participantCount: 0,

            likesCount: 0,
            isLikedByCurrentUser: false,
            reviewCount: 0,
            averageRating: null,

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
                maxParticipants: "10",
                likesCount: "6",
                isLikedByCurrentUser: true,
                reviewCount: "2",
                averageRating: "4.5"
            })
        );

        expect(event.participantCount).toBe(3);
        expect(event.maxParticipants).toBe(10);

        expect(event.likesCount).toBe(6);
        expect(event.isLikedByCurrentUser).toBe(true);

        expect(event.reviewCount).toBe(2);
        expect(event.averageRating).toBe(4.5);
    });

    it("should normalize structured location fields", () => {
        const event = normalizeEvent({
            location: "Agora du Vieux-Port",
            locationLabel: "Agora du Vieux-Port, Rue de Quercy, Québec, Canada",
            streetAddress: "Rue de Quercy",
            city: "Québec",
            region: "Québec",
            postalCode: "G1K 4B9",
            country: "Canada",
            latitude: 46.8176197,
            longitude: -71.2004237
        });

        expect(event).toMatchObject({
            location: "Agora du Vieux-Port",
            locationLabel: "Agora du Vieux-Port, Rue de Quercy, Québec, Canada",
            streetAddress: "Rue de Quercy",
            city: "Québec",
            region: "Québec",
            postalCode: "G1K 4B9",
            country: "Canada",
            latitude: 46.8176197,
            longitude: -71.2004237
        });
    });

    it("should keep maxParticipants as null when missing", () => {
        expect(normalizeEvent({}).maxParticipants).toBeNull();
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
       REVIEW STATS
    ============================= */

    it("should normalize review stats", () => {
        const event = normalizeEvent({
            reviewCount: "12",
            averageRating: "4.7"
        });

        expect(event.reviewCount).toBe(12);
        expect(event.averageRating).toBe(4.7);
    });

    it("should use fallback review stats when missing", () => {
        const event = normalizeEvent({});

        expect(event.reviewCount).toBe(0);
        expect(event.averageRating).toBeNull();
    });

    it("should keep average rating null when missing", () => {
        expect(normalizeEvent({
            averageRating: null
        }).averageRating).toBeNull();

        expect(normalizeEvent({
            averageRating: undefined
        }).averageRating).toBeNull();
    });

    /* =============================
       LIKE METADATA
    ============================= */

    it("should normalize like metadata", () => {
        const event = normalizeEvent({
            likesCount: "12",
            isLikedByCurrentUser: true
        });

        expect(event.likesCount).toBe(12);
        expect(event.isLikedByCurrentUser).toBe(true);
    });

    it("should use fallback like metadata when missing", () => {
        const event = normalizeEvent({});

        expect(event.likesCount).toBe(0);
        expect(event.isLikedByCurrentUser).toBe(false);
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

    it("should normalize paginated event payload with totalItems fallback", () => {
        const result = normalizePaginatedEvents({
            events: [
                createEvent({
                    id: 1,
                    title: "Event 1"
                })
            ],
            page: 1,
            pageSize: 4,
            totalItems: 9,
            totalPages: 3
        });

        expect(result).toMatchObject({
            page: 1,
            pageSize: 4,
            totalEvents: 9,
            totalPages: 3
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
                        image: "/uploads/events/event.png",
                        reviewCount: 2,
                        averageRating: 4.5
                    })
                ]
            }
        };

        const events = getNormalizedEvents(payload);

        expect(events).toHaveLength(1);

        expect(events[0]).toMatchObject({
            id: 1,
            title: "Event 1",
            image: "/uploads/events/event.png",
            reviewCount: 2,
            averageRating: 4.5
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
