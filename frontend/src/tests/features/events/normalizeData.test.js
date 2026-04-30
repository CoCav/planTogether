import { describe, expect, it } from "vitest";
import { getMyEventsWithRole, getNormalizedEvent, getNormalizedEvents, getNormalizedMembers, getNormalizedOrganizers, normalizeEvent, normalizeEvents } from "../../../features/events/normalizeData";

/* ==================================================
   NORMALIZE DATA TESTS
   Tests event and user data normalization helpers
================================================== */

describe("normalizeData", () => {
    it("normalizes a single event with default values", () => {
        const event = normalizeEvent({ id: 1, title: "Test Event" });

        expect(event).toMatchObject({
            id: 1,
            title: "Test Event",
            description: "",
            mode: "in_person",
            location: "",
            creatorName: "",
            participantCount: 0,
            status: "upcoming"
        });
    });

    it("normalizes participantCount as a number", () => {
        const event = normalizeEvent({
            id: 1,
            title: "Test Event",
            participantCount: "3"
        });

        expect(event.participantCount).toBe(3);
    });

    it("normalizes maxParticipants correctly", () => {
        const event = normalizeEvent({
            id: 1,
            maxParticipants: "10"
        });

        expect(event.maxParticipants).toBe(10);
    });

    it("sets maxParticipants to null when missing", () => {
        const event = normalizeEvent({ id: 1 });

        expect(event.maxParticipants).toBeNull();
    });

    it("normalizes creator name from nested object", () => {
        const event = normalizeEvent({
            id: 1,
            creator: {
                name: "Alice"
            }
        });

        expect(event.creatorName).toBe("Alice");
    });

    it("normalizes an array of events", () => {
        const events = normalizeEvents([
            { id: 1, title: "Event 1" },
            { id: 2, title: "Event 2" }
        ]);

        expect(events).toHaveLength(2);
        expect(events[0].title).toBe("Event 1");
        expect(events[1].title).toBe("Event 2");
    });

    it("returns empty array when normalizeEvents receives invalid data", () => {
        expect(normalizeEvents(null)).toEqual([]);
        expect(normalizeEvents({})).toEqual([]);
    });

    it("extracts and normalizes events from API response", () => {
        const response = {
            data: {
                events: [{ id: 1, title: "Event 1" }]
            }
        };

        const events = getNormalizedEvents(response);

        expect(events).toHaveLength(1);
        expect(events[0].title).toBe("Event 1");
    });

    it("extracts and normalizes a single event from API response", () => {
        const response = {
            data: {
                event: { id: 1, title: "Single Event" }
            }
        };

        const event = getNormalizedEvent(response);

        expect(event.title).toBe("Single Event");
    });

    it("normalizes my events with role from membership wrapper", () => {
        const response = {
            data: {
                events: [
                    {
                        role: "organizer",
                        Event: {
                            id: 1,
                            title: "Created Event",
                            status: "upcoming",
                            participantCount: 2,
                            creator: {
                                name: "Alice"
                            }
                        }
                    }
                ]
            }
        };

        const events = getMyEventsWithRole(response);

        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
            id: 1,
            title: "Created Event",
            role: "organizer",
            status: "upcoming",
            participantCount: 2,
            creatorName: "Alice"
        });
    });

    it("defaults my event role to participant when missing", () => {
        const response = {
            data: {
                events: [
                    {
                        Event: {
                            id: 2,
                            title: "Joined Event"
                        }
                    }
                ]
            }
        };

        const events = getMyEventsWithRole(response);

        expect(events[0].role).toBe("participant");
    });

    it("normalizes members", () => {
        const response = {
            data: {
                members: [
                    {
                        role: "participant",
                        User: {
                            id: 1,
                            name: "Alice",
                            email: "alice@test.com"
                        }
                    }
                ]
            }
        };

        const members = getNormalizedMembers(response);

        expect(members).toEqual([
            {
                id: 1,
                name: "Alice",
                email: "alice@test.com",
                role: "participant"
            }
        ]);
    });

    it("normalizes organizers", () => {
        const response = {
            data: {
                organizers: [
                    {
                        role: "organizer",
                        User: {
                            id: 1,
                            name: "Alice",
                            email: "alice@test.com"
                        }
                    }
                ]
            }
        };

        const organizers = getNormalizedOrganizers(response);

        expect(organizers).toEqual([
            {
                id: 1,
                name: "Alice",
                email: "alice@test.com",
                role: "organizer"
            }
        ]);
    });
});
