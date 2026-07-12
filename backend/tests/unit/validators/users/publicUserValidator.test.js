const {
    publicUserIdParamValidator,
    getPublicUserEventsValidator
} = require("../../../../src/validators/users/publicUserValidator");

const {
    runValidation,
    getValidationMessages
} = require("../../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Public User Validator Unit Tests

   Tests public user request validation.

   Responsibilities
   - Test public user ID validation
   - Test public user event query validation
   - Test query sanitization and conversion
   - Test supported public event views

   Notes
   - Public user event queries reuse shared filters, pagination and sorting.
=========================================================================== */

describe("public user validator", () => {

    /* =============================
       PUBLIC USER ID
    ============================= */

    describe("publicUserIdParamValidator", () => {
        it("accepts and converts a positive public user ID", async () => {
            const { errors, req } = await runValidation(
                publicUserIdParamValidator,
                {
                    params: {
                        id: "12"
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.params.id).toBe(12);
        });

        it.each([
            ["zero", "0"],
            ["negative", "-1"],
            ["non-numeric", "abc"],
            ["missing", undefined]
        ])("rejects a %s public user ID", async (_, id) => {
            const params = {};

            if (id !== undefined) {
                params.id = id;
            }

            const { errors } = await runValidation(
                publicUserIdParamValidator,
                { params }
            );

            expect(getValidationMessages(errors)).toContain("User ID must be a positive integer");
        });
    });

    /* =============================
       PUBLIC USER EVENTS
    ============================= */

    describe("getPublicUserEventsValidator", () => {
        it("accepts an empty query", async () => {
            const { errors } = await runValidation(
                getPublicUserEventsValidator
            );

            expect(errors).toHaveLength(0);
        });

        it.each([
            "created",
            "joined"
        ])("accepts the %s view", async (view) => {
            const { errors } = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        view
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("rejects an unsupported view", async () => {
            const { errors } = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        view: "createdHistory"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("View must be one of: created, joined");
        });

        it("accepts valid shared filters, pagination and sorting", async () => {
            const { errors, req } = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        view: "created",
                        status: "upcoming",
                        creator: "  Jane Doe  ",
                        mode: "online",
                        type: "  Meetup  ",
                        theme: "  Technology  ",
                        location: "  Montreal  ",
                        search: "  community  ",
                        date: "2026-12-31",
                        startDate: "2026-12-01",
                        endDate: "2026-12-31",
                        page: "2",
                        pageSize: "10",
                        sortBy: "title",
                        order: "DESC"
                    }
                }
            );

            expect(errors).toHaveLength(0);

            expect(req.query).toMatchObject({
                creator: "Jane Doe",
                type: "Meetup",
                theme: "Technology",
                location: "Montreal",
                search: "community",
                page: 2,
                pageSize: 10,
                order: "desc"
            });
        });

        it.each([
            [
                "status",
                { status: "cancelled" },
                "Status must be upcoming, ongoing or past"
            ],
            [
                "mode",
                { mode: "hybrid" },
                "Mode must be online or in_person"
            ],
            [
                "page",
                { page: "0" },
                "Page must be a positive integer"
            ],
            [
                "page size",
                { pageSize: "101" },
                "Page size must be between 1 and 100"
            ],
            [
                "sort field",
                { sortBy: "creatorId" },
                "Sort field must be one of: startDateTime, title, createdAt"
            ],
            [
                "sort order",
                { order: "random" },
                "Order must be asc or desc"
            ],
            [
                "date",
                { date: "not-a-date" },
                "Date must be a valid ISO8601 date"
            ]
        ])(
            "rejects an invalid %s query",
            async (_, query, expectedMessage) => {
                const { errors } = await runValidation(
                    getPublicUserEventsValidator,
                    { query }
                );

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );
    });
});
