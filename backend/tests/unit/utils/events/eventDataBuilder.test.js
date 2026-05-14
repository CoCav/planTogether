/* ==================================================
   EVENT DATA BUILDER UTILS TESTS

   Tests:
   - event creation payload building
   - online event creation location normalization
   - nullable create fields normalization
   - partial event update payload building
   - online event update location normalization
   - existing image preservation
   - image update handling

   Ensures:
   - event create payloads are normalized before persistence
   - partial update payloads only include provided fields
   - online events never keep a physical location
   - existing images are preserved unless explicitly updated
================================================== */

const { buildEventCreateData, buildEventUpdateData } = require("../../../../src/utils/events/eventDataBuilder");

const { EVENT_MODES } = require("../../../../src/constants/eventModes");

describe("eventDataBuilder utils", () => {

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
        }, 10);

        expect(result).toEqual({
            creatorId: 10,
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
        });
    });

    it("should normalize online event creation location to null", () => {
        const result = buildEventCreateData({
            title: "Online Event",
            description: "Description",
            type: "Workshop",
            theme: "Technology",
            mode: EVENT_MODES.ONLINE,
            location: "Montreal",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z"
        }, 10);

        expect(result.location).toBeNull();
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
    });

    /* =============================
       UPDATE EVENT DATA
    ============================= */

    it("should build partial event update data with provided fields only", () => {
        const event = {
            image: "/uploads/events/current.png"
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

    it("should normalize online event update location to null", () => {
        const event = {
            image: "/uploads/events/current.png"
        };

        const result = buildEventUpdateData(event, {
            mode: EVENT_MODES.ONLINE,
            location: "Montreal"
        });

        expect(result).toMatchObject({
            mode: EVENT_MODES.ONLINE,
            location: null
        });
    });

    it("should update location when provided for in-person event", () => {
        const event = {
            image: "/uploads/events/current.png"
        };

        const result = buildEventUpdateData(event, {
            mode: EVENT_MODES.IN_PERSON,
            location: "Quebec City"
        });

        expect(result).toMatchObject({
            mode: EVENT_MODES.IN_PERSON,
            location: "Quebec City"
        });
    });

    it("should preserve existing image when image is omitted", () => {
        const event = {
            image: "/uploads/events/current.png"
        };

        const result = buildEventUpdateData(event, {
            title: "Updated Title"
        });

        expect(result.image).toBe("/uploads/events/current.png");
    });

    it("should set image when image is provided", () => {
        const event = {
            image: "/uploads/events/current.png"
        };

        const result = buildEventUpdateData(event, {
            image: "/uploads/events/new.png"
        });

        expect(result.image).toBe("/uploads/events/new.png");
    });
});
