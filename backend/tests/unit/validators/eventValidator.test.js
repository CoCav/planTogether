/* ==================================================
   EVENT VALIDATOR TESTS

   Tests:
   - event creation validation
   - event update validation
   - event query validation
   - eventId param validation
   - date order validation
   - mode and location validation

   Ensures:
   - invalid event payloads are rejected early
   - required event fields are enforced
   - event dates, query params and route params are validated
================================================== */

const { createEventValidator, updateEventValidator, eventIdParamValidator, getAllEventsValidator } = require("../../../src/validators/eventValidator");

const { EVENT_STATUS } = require("../../../src/constants/eventStatus");
const { EVENT_MODES } = require("../../../src/constants/eventModes");

const { runValidation } = require("../../helpers/validation/validationHelper");

const { createValidEventBody } = require("../../factories/eventValidationFactory");

describe("eventValidator", () => {

    /* =============================
       CREATE EVENT VALIDATION
    ============================= */

    describe("createEventValidator", () => {
        it("should pass with valid event data", async () => {
            const result = await runValidation(createEventValidator, {
                body: createValidEventBody()
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
                    ...createValidEventBody(),
                    startDateTime: "invalid-date",
                    endDateTime: "invalid-date"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Start date and time must be a valid ISO8601 date" }),
                    expect.objectContaining({ msg: "End date and time must be a valid ISO8601 date" })
                ])
            );
        });

        it("should fail when endDateTime is before startDateTime", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...createValidEventBody(),
                    startDateTime: "2026-12-20T12:00:00.000Z",
                    endDateTime: "2026-12-20T10:00:00.000Z"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "End date and time must be after start date and time" })
                ])
            );
        });

        it("should fail when mode is invalid", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...createValidEventBody(),
                    mode: "hybrid"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Mode must be online or in_person" })
                ])
            );
        });

        it("should require location for in-person events", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...createValidEventBody(),
                    mode: EVENT_MODES.IN_PERSON,
                    location: ""
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Location is required for in-person events" })
                ])
            );
        });

        it("should allow empty location for online events", async () => {
            const result = await runValidation(createEventValidator, {
                body: {
                    ...createValidEventBody(),
                    mode: EVENT_MODES.ONLINE,
                    location: ""
                }
            });

            expect(result.isEmpty()).toBe(true);
        });
    });

    /* =============================
       UPDATE EVENT VALIDATION
    ============================= */

    describe("updateEventValidator", () => {
        it("should pass with valid update data", async () => {
            const result = await runValidation(updateEventValidator, {
                params: { eventId: "1" },
                body: createValidEventBody()
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail when update endDateTime is before startDateTime", async () => {
            const result = await runValidation(updateEventValidator, {
                params: { eventId: "1" },
                body: {
                    ...createValidEventBody(),
                    startDateTime: "2026-12-20T12:00:00.000Z",
                    endDateTime: "2026-12-20T10:00:00.000Z"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "End date and time must be after start date and time" })
                ])
            );
        });
    });

    /* =============================
       EVENT QUERY VALIDATION
    ============================= */

    describe("getAllEventsValidator", () => {
        it("should pass with valid query params", async () => {
            const result = await runValidation(getAllEventsValidator, {
                query: {
                    status: EVENT_STATUS.UPCOMING,
                    mode: EVENT_MODES.ONLINE,
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
                query: {
                    sortBy: "invalid"
                }
            });

            expect(result.array()[0].msg).toMatch(/invalid sort field/i);
        });

        it("should fail with invalid page", async () => {
            const result = await runValidation(getAllEventsValidator, {
                query: {
                    page: "0"
                }
            });

            expect(result.array()[0].msg).toMatch(/page must be a positive integer/i);
        });

        it("should fail with invalid date", async () => {
            const result = await runValidation(getAllEventsValidator, {
                query: {
                    date: "bad-date"
                }
            });

            expect(result.array()[0].msg).toMatch(/date must be a valid iso8601 date/i);
        });
    });

    /* =============================
       EVENT ID PARAM VALIDATION
    ============================= */

    describe("eventIdParamValidator", () => {
        it("should pass with valid eventId", async () => {
            const result = await runValidation(eventIdParamValidator, {
                params: {
                    eventId: "1"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail with invalid eventId", async () => {
            const result = await runValidation(eventIdParamValidator, {
                params: {
                    eventId: "abc"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Event ID must be a positive integer" })
                ])
            );
        });
    });
});
