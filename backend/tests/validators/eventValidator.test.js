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

const { validationResult } = require("express-validator");

const { createEventValidator, updateEventValidator, eventIdParamValidator } = require("../../src/validators/eventValidator");

// Run express-validator rules against mocked request params/body
const runValidation = async (validators, { params = {}, body = {} } = {}) => {
    const req = { params, body };

    for (const validator of validators) {
        await validator.run(req);
    }

    return validationResult(req);
};

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
                        msg: "Start date and time must be a valid ISO 8601 date"
                    }),
                    expect.objectContaining({
                        msg: "End date and time must be a valid ISO 8601 date"
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
                        msg: "Mode must be either online or in_person"
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

        it("should fail when eventId is invalid", async () => {
            const result = await runValidation(updateEventValidator, {
                params: { eventId: "abc" },
                body: validEventBody
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Event ID must be a positive integer"
                    })
                ])
            );
        });

        it("should fail when required update date fields are missing", async () => {
            const result = await runValidation(updateEventValidator, {
                params: { eventId: "1" },
                body: {
                    title: "Updated Event",
                    mode: "online"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Start date and time is required"
                    }),
                    expect.objectContaining({
                        msg: "End date and time is required"
                    })
                ])
            );
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
