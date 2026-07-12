const { EVENT_MODES } = require("../../../../src/constants/eventModes");

const {
    buildCreateEventPayload,
    buildUpdateEventPayload,
    buildEmptyStructuredLocationData,
    buildStructuredLocationData
} = require("../../../../src/utils/events/eventPayloadBuilder");

/* ==========================================================================
   Event Payload Builder Unit Tests

   Tests normalized event persistence payloads.

   Responsibilities
   - Test empty structured location data
   - Test structured location normalization
   - Test event creation payloads
   - Test event update payloads
   - Test online event location cleanup
   - Test nullable fields
   - Test image preservation, replacement and removal

   Notes
   - Online events never retain physical location data.
   - Update payloads preserve omitted event fields.
=========================================================================== */

describe("event payload builder", () => {

    /* =============================
       STRUCTURED LOCATION DATA
    ============================= */

    describe("buildEmptyStructuredLocationData", () => {
        it("builds empty structured location data", () => {
            expect(buildEmptyStructuredLocationData()).toEqual({
                location: null,
                locationLabel: null,
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null,
                latitude: null,
                longitude: null
            });
        });
    });

    describe("buildStructuredLocationData", () => {
        it("builds structured data from a resolved location", () => {
            expect(buildStructuredLocationData({
                latitude: 45.5031824,
                longitude: -73.5698065,
                label: "Montréal, Québec, Canada",
                streetAddress: "123 Rue Sainte-Catherine",
                city: "Montréal",
                region: "Québec",
                postalCode: "H2X 1Y4",
                country: "Canada"
            })).toEqual({
                locationLabel: "Montréal, Québec, Canada",
                streetAddress: "123 Rue Sainte-Catherine",
                city: "Montréal",
                region: "Québec",
                postalCode: "H2X 1Y4",
                country: "Canada",
                latitude: 45.5031824,
                longitude: -73.5698065
            });
        });

        it("uses locationLabel when label is unavailable", () => {
            expect(buildStructuredLocationData({
                latitude: 45.5031824,
                longitude: -73.5698065,
                locationLabel: "Montréal, Québec, Canada"
            })).toEqual({
                locationLabel: "Montréal, Québec, Canada",
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null,
                latitude: 45.5031824,
                longitude: -73.5698065
            });
        });

        it("normalizes missing location data to null", () => {
            expect(buildStructuredLocationData()).toEqual({
                locationLabel: null,
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null,
                latitude: null,
                longitude: null
            });
        });
    });

    /* =============================
       EVENT CREATION PAYLOAD
    ============================= */

    describe("buildCreateEventPayload", () => {
        it("builds a complete in-person event payload", () => {
            const result = buildCreateEventPayload(
                {
                    title: "Test Event",
                    description: "Description",
                    type: "Meetup",
                    theme: "Technology",
                    mode: EVENT_MODES.IN_PERSON,
                    location: "Montreal",
                    startDateTime: "2026-12-31T10:00:00.000Z",
                    endDateTime: "2026-12-31T12:00:00.000Z",
                    maxParticipants: 20,
                    registrationDeadline:
                        "2026-12-30T10:00:00.000Z",
                    image: "/uploads/events/event.png"
                },
                10,
                {
                    latitude: 45.5031824,
                    longitude: -73.5698065,
                    label: "Montréal, Québec, Canada",
                    streetAddress: "123 Rue Sainte-Catherine",
                    city: "Montréal",
                    region: "Québec",
                    postalCode: "H2X 1Y4",
                    country: "Canada"
                }
            );

            expect(result).toEqual({
                creatorId: 10,
                title: "Test Event",
                description: "Description",
                type: "Meetup",
                theme: "Technology",
                mode: EVENT_MODES.IN_PERSON,

                location: "Montreal",
                locationLabel: "Montréal, Québec, Canada",
                streetAddress: "123 Rue Sainte-Catherine",
                city: "Montréal",
                region: "Québec",
                postalCode: "H2X 1Y4",
                country: "Canada",
                latitude: 45.5031824,
                longitude: -73.5698065,

                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z",
                maxParticipants: 20,
                registrationDeadline:
                    "2026-12-30T10:00:00.000Z",
                image: "/uploads/events/event.png"
            });
        });

        it("clears physical location data for an online event", () => {
            const result = buildCreateEventPayload(
                {
                    title: "Online Event",
                    description: "Description",
                    type: "Workshop",
                    theme: "Technology",
                    mode: EVENT_MODES.ONLINE,
                    location: "Montreal",
                    startDateTime: "2026-12-31T10:00:00.000Z",
                    endDateTime: "2026-12-31T12:00:00.000Z"
                },
                10,
                {
                    latitude: 45.5031824,
                    longitude: -73.5698065,
                    label: "Montréal, Québec, Canada"
                }
            );

            expect(result).toMatchObject(buildEmptyStructuredLocationData());
        });

        it("normalizes omitted nullable fields to null", () => {
            const result = buildCreateEventPayload(
                {
                    title: "Nullable Event",
                    description: "Description",
                    type: "Meetup",
                    theme: "Technology",
                    mode: EVENT_MODES.IN_PERSON,
                    location: "Montreal",
                    startDateTime: "2026-12-31T10:00:00.000Z",
                    endDateTime: "2026-12-31T12:00:00.000Z"
                },
                10
            );

            expect(result).toMatchObject({
                maxParticipants: null,
                registrationDeadline: null,
                image: null,
                locationLabel: null,
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null,
                latitude: null,
                longitude: null
            });
        });
    });

    /* =============================
       EVENT UPDATE PAYLOAD
    ============================= */

    describe("buildUpdateEventPayload", () => {
        const currentEvent = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        it("includes only provided updatable fields", () => {
            const result = buildUpdateEventPayload(
                currentEvent,
                {
                    title: "Updated Title",
                    theme: "Design"
                }
            );

            expect(result).toEqual({
                title: "Updated Title",
                theme: "Design",
                image: "/uploads/events/current.png"
            });
        });

        it("clears physical location data when changing to online", () => {
            const result = buildUpdateEventPayload(
                currentEvent,
                {
                    mode: EVENT_MODES.ONLINE,
                    location: "Montreal"
                }
            );

            expect(result).toMatchObject({
                mode: EVENT_MODES.ONLINE,
                ...buildEmptyStructuredLocationData()
            });
        });

        it("updates physical location and structured data", () => {
            const result = buildUpdateEventPayload(
                currentEvent,
                {
                    mode: EVENT_MODES.IN_PERSON,
                    location: "Quebec City"
                },
                {
                    latitude: 46.8137431,
                    longitude: -71.2084061,
                    label: "Québec, Canada",
                    streetAddress: "2 Rue des Jardins",
                    city: "Québec",
                    region: "Québec",
                    postalCode: "G1R 4L5",
                    country: "Canada"
                }
            );

            expect(result).toMatchObject({
                mode: EVENT_MODES.IN_PERSON,
                location: "Quebec City",
                locationLabel: "Québec, Canada",
                streetAddress: "2 Rue des Jardins",
                city: "Québec",
                region: "Québec",
                postalCode: "G1R 4L5",
                country: "Canada",
                latitude: 46.8137431,
                longitude: -71.2084061
            });
        });

        it("normalizes missing resolved location data to null", () => {
            const result = buildUpdateEventPayload(
                currentEvent,
                {
                    mode: EVENT_MODES.IN_PERSON,
                    location: "Unknown place"
                }
            );

            expect(result).toMatchObject({
                mode: EVENT_MODES.IN_PERSON,
                location: "Unknown place",
                locationLabel: null,
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null,
                latitude: null,
                longitude: null
            });
        });

        it("preserves the current image when omitted", () => {
            const result = buildUpdateEventPayload(
                currentEvent,
                {
                    title: "Updated Title"
                }
            );

            expect(result.image).toBe("/uploads/events/current.png");
        });

        it("replaces the current image when provided", () => {
            const result = buildUpdateEventPayload(
                currentEvent,
                {
                    image: "/uploads/events/new.png"
                }
            );

            expect(result.image).toBe("/uploads/events/new.png");
        });

        it.each([
            ["null", null],
            ["empty string", ""]
        ])("clears the current image with %s", (_, image) => {
            const result = buildUpdateEventPayload(
                currentEvent,
                { image }
            );

            expect(result.image).toBeNull();
        });
    });
});
