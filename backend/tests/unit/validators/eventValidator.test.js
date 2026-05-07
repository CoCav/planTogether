/* ==================================================
   EVENT VALIDATOR TESTS

   Tests:
   - event creation validation
   - event update validation
   - eventId param validation
   - date order validation
   - mode and location validation

   Ensures:
   - invalid event payloads are rejected early
   - required event fields are enforced
   - event dates and route params are validated
================================================== */

const { createEventValidator, updateEventValidator, eventIdParamValidator, getAllEventsValidator } = require("../../../src/validators/eventValidator");

const { runValidation } = require("../../helpers/validationHelper");

const validEventBody = {
    title: "Test Event",
    description: "Event description",
    startDateTime: "2026-12-20T10:00:00.000Z",
    endDateTime: "2026-12-20T12:00:00.000Z",
    mode: "in_person",
    location: "Montreal",
    type: "Meetup",
    theme: "Tech"
};

describe("eventValidator", () => {

    describe("createEventValidator", () => {
        it("should pass with valid event data", async () => {
            const result = await runValidation(createEventValidator, {
                body: validEventBody
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail when required fields are missing", async () => {
            const result = await runValidation(createEventValidator, {
                body: {}
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Title is required" }),
                    expect.objectContaining({ msg: "Description is required" }),
                    expect.objectContaining({ msg: "Mode is required" }),
                    expect.objectContaining({ msg: "Type is required" }),
                    expect.objectContaining({ msg: "Theme is required" })
                ])
            );
        });

        it("should fail when dates are invalid", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...validEventBody,
                    startDateTime: "invalid-date",
                    endDateTime: "invalid-date"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Start date and time must be a valid ISO8601 date"
                    }),
                    expect.objectContaining({
                        msg: "End date and time must be a valid ISO8601 date"
                    })
                ])
            );
        });

        it("should fail when endDateTime is before startDateTime", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...validEventBody,
                    startDateTime: "2026-12-20T12:00:00.000Z",
                    endDateTime: "2026-12-20T10:00:00.000Z"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "End date and time must be after start date and time"
                    })
                ])
            );
        });

        it("should fail when mode is invalid", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...validEventBody,
                    mode: "hybrid"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Mode must be online or in_person"
                    })
                ])
            );
        });

        it("should require location for in-person events", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...validEventBody,
                    mode: "in_person",
                    location: ""
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Location is required for in-person events"
                    })
                ])
            );
        });

        it("should allow empty location for online events", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...validEventBody,
                    mode: "online",
                    location: ""
                }
            });

            expect(result.isEmpty()).toBe(true);
        });
    });

    describe("updateEventValidator", () => {
        it("should pass with valid update data", async () => {
            const result = await runValidation(updateEventValidator, {
                params: { eventId: "1" },
                body: validEventBody
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail when update endDateTime is before startDateTime", async () => {
            const result = await runValidation(updateEventValidator, {
                params: { eventId: "1" },
                body: {
                    ...validEventBody,
                    startDateTime: "2026-12-20T12:00:00.000Z",
                    endDateTime: "2026-12-20T10:00:00.000Z"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "End date and time must be after start date and time"
                    })
                ])
            );
        });
    });

    describe("getAllEventsValidator", () => {
        it("should pass with valid query params", async () => {
            const result = await runValidation(getAllEventsValidator, {
                query: {
                    status: "upcoming",
                    mode: "online",
                    page: "1",
                    pageSize: "10",
                    sortBy: "creatorId",
                    order: "desc"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail with invalid sortBy", async () => {
            const result = await runValidation(getAllEventsValidator, {
                query: { sortBy: "invalid" }
            });

            expect(result.array()[0].msg).toMatch(/invalid sort field/i);
        });

        it("should fail with invalid page", async () => {
            const result = await runValidation(getAllEventsValidator, {
                query: { page: "0" }
            });

            expect(result.array()[0].msg).toMatch(/page must be a positive integer/i);
        });

        it("should fail with invalid date", async () => {
            const result = await runValidation(getAllEventsValidator, {
                query: { date: "bad-date" }
            });

            expect(result.array()[0].msg).toMatch(/date must be a valid iso8601 date/i);
        });
    });

    describe("eventIdParamValidator", () => {
        it("should pass with valid eventId", async () => {
            const result = await runValidation(eventIdParamValidator, {
                params: { eventId: "1" }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail with invalid eventId", async () => {
            const result = await runValidation(eventIdParamValidator, {
                params: { eventId: "abc" }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Event ID must be a positive integer"
                    })
                ])
            );
        });
    });
});
