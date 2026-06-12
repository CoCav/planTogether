/* ==================================================
   EVENT DATA BUILDER TESTS

   Tests:
   - event creation payload building
   - physical event geolocation persistence
   - online event creation location normalization
   - nullable create fields normalization
   - partial event update payload building
   - online event update location and geolocation clearing
   - physical event location and geolocation update
   - existing image preservation
   - image replacement and clearing

   Ensures:
   - event create payloads are normalized before persistence
   - partial update payloads preserve omitted fields
   - online events never keep physical location or geolocation data
   - physical events persist resolved coordinates when available
   - existing images are preserved unless explicitly updated or cleared
================================================== */

const {
    buildEventCreateData,
    buildEventUpdateData,
    buildEmptyLocationData,
    buildLocationData
} = require("../../../../src/utils/events/eventDataBuilder");

const { EVENT_MODES } = require("../../../../src/constants/eventModes");

describe("eventDataBuilder utils", () => {

    /* =============================
       LOCATION DATA
    ============================= */

    it("should build empty location data", () => {
        expect(buildEmptyLocationData()).toEqual({
            latitude: null,
            longitude: null,
            locationLabel: null
        });
    });

    it("should build persisted location data from resolved location", () => {
        expect(buildLocationData({
            latitude: 45.5031824,
            longitude: -73.5698065,
            label: "Montréal, Québec, Canada"
        })).toEqual({
            latitude: 45.5031824,
            longitude: -73.5698065,
            locationLabel: "Montréal, Québec, Canada"
        });
    });

    it("should support locationLabel as fallback location label source", () => {
        expect(buildLocationData({
            latitude: 45.5031824,
            longitude: -73.5698065,
            locationLabel: "Montréal, Québec, Canada"
        })).toEqual({
            latitude: 45.5031824,
            longitude: -73.5698065,
            locationLabel: "Montréal, Québec, Canada"
        });
    });

    /* =============================
       CREATE EVENT DATA
    ============================= */

    it("should build event creation data", () => {
        const result = buildEventCreateData({
            title: "Test Event",
            description: "Description",
            type: "Meetup",
            theme: "Technology",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z",
            maxParticipants: 20,
            registrationDeadline: "2026-12-30T10:00:00.000Z",
            image: "/uploads/events/event.png"
        }, 10, {
            latitude: 45.5031824,
            longitude: -73.5698065,
            label: "Montréal, Québec, Canada"
        });

        expect(result).toEqual({
            creatorId: 10,
            title: "Test Event",
            description: "Description",
            type: "Meetup",
            theme: "Technology",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            latitude: 45.5031824,
            longitude: -73.5698065,
            locationLabel: "Montréal, Québec, Canada",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z",
            maxParticipants: 20,
            registrationDeadline: "2026-12-30T10:00:00.000Z",
            image: "/uploads/events/event.png"
        });
    });

    it("should normalize online event creation location and geolocation to null", () => {
        const result = buildEventCreateData({
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
    });

    it("should normalize nullable create fields to null", () => {
        const result = buildEventCreateData({
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
    });

    /* =============================
       UPDATE EVENT DATA
    ============================= */

    it("should build partial event update data with provided fields only", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildEventUpdateData(event, {
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

        const result = buildEventUpdateData(event, {
            mode: EVENT_MODES.ONLINE,
            location: "Montreal"
        });

        expect(result).toMatchObject({
            mode: EVENT_MODES.ONLINE,
            location: null,
            latitude: null,
            longitude: null,
            locationLabel: null
        });
    });

    it("should update physical event location and geolocation when provided", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildEventUpdateData(event, {
            mode: EVENT_MODES.IN_PERSON,
            location: "Quebec City"
        }, {
            latitude: 46.8137431,
            longitude: -71.2084061,
            label: "Québec, Canada"
        });

        expect(result).toMatchObject({
            mode: EVENT_MODES.IN_PERSON,
            location: "Quebec City",
            latitude: 46.8137431,
            longitude: -71.2084061,
            locationLabel: "Québec, Canada"
        });
    });

    it("should update physical location with null geolocation when no location data is provided", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildEventUpdateData(event, {
            mode: EVENT_MODES.IN_PERSON,
            location: "Unknown place"
        });

        expect(result).toMatchObject({
            mode: EVENT_MODES.IN_PERSON,
            location: "Unknown place",
            latitude: null,
            longitude: null,
            locationLabel: null
        });
    });

    it("should preserve existing image when image is omitted", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildEventUpdateData(event, {
            title: "Updated Title"
        });

        expect(result.image).toBe("/uploads/events/current.png");
    });

    it("should replace existing image when a new image is provided", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildEventUpdateData(event, {
            image: "/uploads/events/new.png"
        });

        expect(result.image).toBe("/uploads/events/new.png");
    });

    it("should clear existing image when image is null", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildEventUpdateData(event, {
            image: null
        });

        expect(result.image).toBeNull();
    });

    it("should clear existing image when image is an empty string", () => {
        const event = {
            image: "/uploads/events/current.png",
            mode: EVENT_MODES.IN_PERSON
        };

        const result = buildEventUpdateData(event, {
            image: ""
        });

        expect(result.image).toBeNull();
    });
});
