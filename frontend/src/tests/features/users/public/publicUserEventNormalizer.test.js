import { describe, expect, it } from "vitest";

import {
    getNormalizedPublicUserEvents,
    normalizePublicUserEvents
} from "../../../../features/users/public/publicUserEventNormalizer";

import { EVENT_STATUS } from "../../../../features/shared/eventStatus";

import { createEvent } from "../../../factories/events/eventFactory";

/* ==================================================
   PUBLIC USER EVENT NORMALIZER TESTS
   Tests public user event payload normalization

   Handles:
   - public user created events
   - public user joined events
   - API payload extraction
   - fallback values

   Notes:
   - uses reusable event test factories
================================================== */

describe("publicUserEventNormalizer", () => {

    /* =============================
       PUBLIC USER EVENTS
    ============================= */

    it("should normalize public user event payload", () => {
        const result = normalizePublicUserEvents({
            createdEvents: [
                createEvent({
                    id: 1,
                    title: "Created Event",
                    status: EVENT_STATUS.UPCOMING
                })
            ],

            joinedEvents: [
                createEvent({
                    id: 2,
                    title: "Joined Event",
                    status: EVENT_STATUS.PAST
                })
            ],

            message: "Public user events retrieved",
            success: true
        });

        expect(result).toEqual({
            createdEvents: [
                expect.objectContaining({
                    id: 1,
                    title: "Created Event",
                    status: EVENT_STATUS.UPCOMING
                })
            ],

            joinedEvents: [
                expect.objectContaining({
                    id: 2,
                    title: "Joined Event",
                    status: EVENT_STATUS.PAST
                })
            ],

            message: "Public user events retrieved",
            success: true
        });
    });

    it("should return fallback values when payload is empty", () => {
        expect(normalizePublicUserEvents()).toEqual({
            createdEvents: [],
            joinedEvents: [],
            message: "",
            success: false
        });
    });

    /* =============================
       API PAYLOAD EXTRACTION
    ============================= */

    it("should extract and normalize public user events from API payload", () => {
        const payload = {
            data: {
                createdEvents: [
                    createEvent({
                        id: 1,
                        title: "Created Event"
                    })
                ],

                joinedEvents: [
                    createEvent({
                        id: 2,
                        title: "Joined Event"
                    })
                ]
            }
        };

        const result = getNormalizedPublicUserEvents(payload);

        expect(result).toEqual({
            createdEvents: [
                expect.objectContaining({
                    id: 1,
                    title: "Created Event"
                })
            ],

            joinedEvents: [
                expect.objectContaining({
                    id: 2,
                    title: "Joined Event"
                })
            ]
        });
    });
});
