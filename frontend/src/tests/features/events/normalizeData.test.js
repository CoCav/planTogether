import { describe, it, expect } from "vitest";
import { normalizeEvent, normalizeEvents, getMyEventsWithRole, getNormalizedMembers } from "../../../features/events/normalizeData";

describe("normalizeData", () => {
    it("should normalize a single event with defaults", () => {
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

    it("should normalize participantCount as a number", () => {
        const event = normalizeEvent({
            id: 1,
            title: "Test Event",
            participantCount: "3"
        });

        expect(event.participantCount).toBe(3);
    });

    it("should normalize creator name", () => {
        const event = normalizeEvent({
            id: 1,
            creator: {
                name: "Alice"
            }
        });

        expect(event.creatorName).toBe("Alice");
    });

    it("should normalize an array of events", () => {
        const events = normalizeEvents([
            { id: 1, title: "Event 1" },
            { id: 2, title: "Event 2" }
        ]);

        expect(events).toHaveLength(2);
        expect(events[0].title).toBe("Event 1");
        expect(events[1].title).toBe("Event 2");
    });

    it("should return an empty array when normalizeEvents receives invalid data", () => {
        expect(normalizeEvents(null)).toEqual([]);
        expect(normalizeEvents({})).toEqual([]);
    });

    it("should normalize my events with role from membership wrapper", () => {
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

    it("should default my event role to participant", () => {
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

    it("should normalize members and organizers", () => {
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
});