/* ==================================================
   EVENT DATA BUILDER TESTS

   Tests:
   - empty structured location data
   - structured location persistence
   - event creation payload building
   - online event creation location normalization
   - nullable create fields normalization
   - partial event update payload building
   - online event update location normalization
   - physical event structured location update
   - existing image preservation
   - image replacement and clearing

   Ensures:
   - structured address fields are normalized before persistence
   - partial update payloads preserve omitted fields
   - online events never keep physical location data
   - physical events persist structured address and coordinates
   - existing images are preserved unless explicitly updated or cleared
================================================== */

const {
    buildCreateEventPayload,
    buildUpdateEventPayload,
    buildEmptyStructuredLocationData,
    buildStructuredLocationData
} = require("../../../../src/utils/events/eventPayploadBuilder");

const { EVENT_MODES } = require("../../../../src/constants/eventModes");

describe("eventDataBuilder utils", () => {

    /* =============================
       LOCATION DATA
    ============================= */

    it("should build empty location data", () => {
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

    it("should build persisted location data from resolved location", () => {
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

    it("should support locationLabel as fallback location label source", () => {
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

    /* =============================
       CREATE EVENT DATA
    ============================= */

    it("should build event creation data", () => {
        const result = buildCreateEventPayload({
            title: "Test Event",
            description: "Description",
            type: "Meetup",
            theme: "Technology",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            streetAddress: "123 Rue Sainte-Catherine",
            city: "Montréal",
            region: "Québec",
            postalCode: "H2X 1Y4",
            country: "Canada",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z",
            maxParticipants: 20,
            registrationDeadline: "2026-12-30T10:00:00.000Z",
            image: "/uploads/events/event.png"
        }, 10, {
            latitude: 45.5031824,
            longitude: -73.5698065,
            label: "Montréal, Québec, Canada",
            streetAddress: "123 Rue Sainte-Catherine",
            city: "Montréal",
            region: "Québec",
            postalCode: "H2X 1Y4",
            country: "Canada"
        });

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
            registrationDeadline: "2026-12-30T10:00:00.000Z",
            image: "/uploads/events/event.png"
        });
    });

    it("should normalize online event creation location and geolocation to null", () => {
        const result = buildCreateEventPayload({
            title: "Online Event",
            description: "Description",
            type: "Workshop",
            theme: "Technology",
            mode: EVENT_MODES.ONLINE,
            location: "Montreal",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z"
        }, 10, {
            latitude: 45.5031824,
            longitude: -73.5698065,
            label: "Montréal, Québec, Canada"
        });

        expect(result.location).toBeNull();
        expect(result.latitude).toBeNull();
        expect(result.longitude).toBeNull();
        expect(result.locationLabel).toBeNull();
        expect(result.streetAddress).toBeNull();
        expect(result.city).toBeNull();
        expect(result.region).toBeNull();
        expect(result.postalCode).toBeNull();
        expect(result.country).toBeNull();
    });

    it("should normalize nullable create fields to null", () => {
        const result = buildCreateEventPayload({
            title: "Nullable Event",
            description: "Description",
            type: "Meetup",
            theme: "Technology",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z"
        }, 10);

        expect(result.maxParticipants).toBeNull();
        expect(result.registrationDeadline).toBeNull();
        expect(result.image).toBeNull();

        expect(result.latitude).toBeNull();
        expect(result.longitude).toBeNull();
        expect(result.locationLabel).toBeNull();
        expect(result.streetAddress).toBeNull();
        expect(result.city).toBeNull();
        expect(result.region).toBeNull();
        expect(result.postalCode).toBeNull();
        expect(result.country).toBeNull();
    });

    /* =============================
       UPDATE EVENT DATA
    ============================= */

    it("should build partial event update data with provided fields only", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildUpdateEventPayload(event, {
            title: "Updated Title",
            theme: "Design"
        });

        expect(result).toEqual({
            title: "Updated Title",
            theme: "Design",
            image: "/uploads/events/current.png"
        });
    });

    it("should normalize online event update location and geolocation to null", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildUpdateEventPayload(event, {
            mode: EVENT_MODES.ONLINE,
            location: "Montreal"
        });

        expect(result).toMatchObject({
            mode: EVENT_MODES.ONLINE,

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

    it("should update physical event location and geolocation when provided", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildUpdateEventPayload(event, {
            mode: EVENT_MODES.IN_PERSON,
            location: "Quebec City"
        }, {
            latitude: 46.8137431,
            longitude: -71.2084061,
            label: "Québec, Canada",
            streetAddress: "2 Rue des Jardins",
            city: "Québec",
            region: "Québec",
            postalCode: "G1R 4L5",
            country: "Canada"
        });

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

    it("should update physical location with null geolocation when no location data is provided", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildUpdateEventPayload(event, {
            mode: EVENT_MODES.IN_PERSON,
            location: "Unknown place"
        });

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

    it("should preserve existing image when image is omitted", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildUpdateEventPayload(event, {
            title: "Updated Title"
        });

        expect(result.image).toBe("/uploads/events/current.png");
    });

    it("should replace existing image when a new image is provided", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildUpdateEventPayload(event, {
            image: "/uploads/events/new.png"
        });

        expect(result.image).toBe("/uploads/events/new.png");
    });

    it("should clear existing image when image is null", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildUpdateEventPayload(event, {
            image: null
        });

        expect(result.image).toBeNull();
    });

    it("should clear existing image when image is an empty string", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildUpdateEventPayload(event, {
            image: ""
        });

        expect(result.image).toBeNull();
    });
});
