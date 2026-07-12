const {
    eventIdParamValidator,
    createEventValidator,
    updateEventValidator,
    getAllEventsValidator
} = require("../../../src/validators/eventValidator");

const {
    runValidation,
    getValidationMessages
} = require("../../helpers/validation/validationTestHelper");

const { createValidEventBody } = require("../../factories/eventValidationFactory");

/* ==========================================================================
   Event Validator Unit Tests

   Tests event request validation.

   Responsibilities
   - Test event identifier exports
   - Test event creation payloads
   - Test event update payloads
   - Test event date business validation
   - Test location requirements
   - Test nullable update fields
   - Test event listing query validation

   Notes
   - Shared parameter, pagination, query and sorting validators are tested
     separately.
   - Event-specific cross-field validation remains covered here.
=========================================================================== */

describe("event validator", () => {

    /* =============================
       EVENT ID EXPORT
    ============================= */

    describe("eventIdParamValidator", () => {
        it("re-exports the shared event ID validator", () => {
            expect(Array.isArray(eventIdParamValidator)).toBe(true);
            expect(eventIdParamValidator).toHaveLength(1);
        });
    });

    /* =============================
       EVENT CREATION SUCCESS
    ============================= */

    describe("createEventValidator success", () => {
        it("accepts a valid in-person event payload", async () => {
            const { errors } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody()
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("accepts an online event without a location", async () => {
            const { errors } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        mode: "online",
                        location: null
                    })
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("trims event text fields", async () => {
            const { errors, req } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        title: "  Tech Meetup  ",
                        description: "  Event description  ",
                        type: "  Meetup  ",
                        theme: "  Technology  ",
                        mode: "  in_person  ",
                        location: "  Montreal  "
                    })
                }
            );

            expect(errors).toHaveLength(0);

            expect(req.body).toMatchObject({
                title: "Tech Meetup",
                description: "Event description",
                type: "Meetup",
                theme: "Technology",
                mode: "in_person",
                location: "Montreal"
            });
        });

        it("accepts omitted optional event fields", async () => {
            const body = createValidEventBody();

            delete body.maxParticipants;
            delete body.registrationDeadline;

            const { errors } = await runValidation(
                createEventValidator,
                { body }
            );

            expect(errors).toHaveLength(0);
        });
    });

    /* =============================
       REQUIRED CREATION FIELDS
    ============================= */

    describe("createEventValidator required fields", () => {
        it.each([
            ["title", "Title is required"],
            ["description", "Description is required"],
            ["type", "Type is required"],
            ["theme", "Theme is required"],
            ["mode", "Mode is required"],
            [
                "startDateTime",
                "Start date and time is required"
            ],
            [
                "endDateTime",
                "End date and time is required"
            ]
        ])(
            "rejects a missing %s",
            async (field, expectedMessage) => {
                const body = createValidEventBody();

                delete body[field];

                const { errors } = await runValidation(
                    createEventValidator,
                    { body }
                );

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );

        it.each([
            ["title", "Title is required"],
            ["description", "Description is required"],
            ["type", "Type is required"],
            ["theme", "Theme is required"]
        ])(
            "rejects an empty %s",
            async (field, expectedMessage) => {
                const body = createValidEventBody({
                    [field]: "   "
                });

                const { errors } = await runValidation(
                    createEventValidator,
                    { body }
                );

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );
    });

    /* =============================
       MODE AND LOCATION
    ============================= */

    describe("Creation mode and location", () => {
        it("rejects an unsupported event mode", async () => {
            const { errors } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        mode: "hybrid"
                    })
                }
            );

            expect(getValidationMessages(errors)).toContain("Mode must be online or in_person");
        });

        it.each([
            ["missing", undefined],
            ["null", null],
            ["empty", ""],
            ["whitespace-only", "   "]
        ])(
            "requires location for an in-person event when %s",
            async (_, location) => {
                const body = createValidEventBody();

                if (location === undefined) {
                    delete body.location;
                } else {
                    body.location = location;
                }

                const { errors } = await runValidation(
                    createEventValidator,
                    { body }
                );

                expect(getValidationMessages(errors)).toContain("Location is required for in-person events");
            }
        );

        it("accepts structured location values and converts coordinates", async () => {
            const { errors, req } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        locationLabel: "  Montreal, Quebec, Canada  ",
                        streetAddress: "  1500 Rue Sainte-Catherine O  ",
                        city: "  Montreal  ",
                        region: "  Quebec  ",
                        postalCode: "  H3G 1S8  ",
                        country: "  Canada  ",
                        latitude: "45.5017",
                        longitude: "-73.5673"
                    })
                }
            );

            expect(errors).toHaveLength(0);

            expect(req.body).toMatchObject({
                locationLabel: "Montreal, Quebec, Canada",
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montreal",
                region: "Quebec",
                postalCode: "H3G 1S8",
                country: "Canada",
                latitude: 45.5017,
                longitude: -73.5673
            });
        });
    });

    /* =============================
       CREATION DATE VALIDATION
    ============================= */

    describe("Creation date validation", () => {
        it.each([
            [
                "start date",
                {
                    startDateTime: "invalid"
                },
                "Start date and time must be a valid ISO8601 date"
            ],
            [
                "end date",
                {
                    endDateTime: "invalid"
                },
                "End date and time must be a valid ISO8601 date"
            ],
            [
                "registration deadline",
                {
                    registrationDeadline: "invalid"
                },
                "Registration deadline must be a valid ISO8601 date"
            ]
        ])(
            "rejects an invalid %s",
            async (_, overrides, expectedMessage) => {
                const { errors } = await runValidation(
                    createEventValidator,
                    {
                        body: createValidEventBody(overrides)
                    }
                );

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );

        it("rejects an end date equal to the start date", async () => {
            const startDateTime = "2026-12-31T10:00:00.000Z";

            const { errors } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        startDateTime,
                        endDateTime: startDateTime
                    })
                }
            );

            expect(getValidationMessages(errors)).toContain("End date and time must be after start date and time");
        });

        it("rejects an end date before the start date", async () => {
            const { errors } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        startDateTime: "2026-12-31T10:00:00.000Z",
                        endDateTime: "2026-12-31T09:00:00.000Z"
                    })
                }
            );

            expect(getValidationMessages(errors)).toContain("End date and time must be after start date and time");
        });

        it("rejects a registration deadline equal to the start date", async () => {
            const startDateTime = "2026-12-31T10:00:00.000Z";

            const { errors } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        startDateTime,
                        registrationDeadline: startDateTime
                    })
                }
            );

            expect(getValidationMessages(errors)).toContain("Registration deadline must be before event start date");
        });

        it("rejects a registration deadline after the start date", async () => {
            const { errors } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        registrationDeadline:
                            "2026-12-31T11:00:00.000Z"
                    })
                }
            );

            expect(getValidationMessages(errors)).toContain("Registration deadline must be before event start date");
        });
    });

    /* =============================
       CREATION PARTICIPANT LIMIT
    ============================= */

    describe("Creation participant limit", () => {
        it("accepts a positive maximum participant count", async () => {
            const { errors } = await runValidation(
                createEventValidator,
                {
                    body: createValidEventBody({
                        maxParticipants: "25"
                    })
                }
            );

            expect(errors).toHaveLength(0);
        });

        it.each([
            ["zero", "0"],
            ["negative", "-1"],
            ["decimal", "2.5"],
            ["non-numeric", "invalid"]
        ])(
            "rejects a %s maximum participant count",
            async (_, maxParticipants) => {
                const { errors } = await runValidation(
                    createEventValidator,
                    {
                        body: createValidEventBody({
                            maxParticipants
                        })
                    }
                );

                expect(getValidationMessages(errors)).toContain("Max participants must be a positive integer");
            }
        );
    });

    /* =============================
       EVENT UPDATE SUCCESS
    ============================= */

    describe("updateEventValidator success", () => {
        it("accepts an empty update payload", async () => {
            const { errors } = await runValidation(
                updateEventValidator
            );

            expect(errors).toHaveLength(0);
        });

        it("accepts valid partial event updates", async () => {
            const { errors, req } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        title: "  Updated Event  ",
                        theme: "  Community  ",
                        mode: "online"
                    }
                }
            );

            expect(errors).toHaveLength(0);

            expect(req.body).toMatchObject({
                title: "Updated Event",
                theme: "Community",
                mode: "online"
            });
        });

        it("accepts an in-person update with a location", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        mode: "in_person",
                        location: "Montreal"
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });
    });

    /* =============================
       EVENT UPDATE VALIDATION
    ============================= */

    describe("updateEventValidator validation", () => {
        it.each([
            ["title", "Title cannot be empty"],
            ["description", "Description cannot be empty"],
            ["type", "Type is required"],
            ["theme", "Theme is required"]
        ])(
            "rejects an empty %s",
            async (field, expectedMessage) => {
                const { errors } = await runValidation(
                    updateEventValidator,
                    {
                        body: {
                            [field]: "   "
                        }
                    }
                );

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );

        it("rejects an unsupported event mode", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        mode: "hybrid"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Mode must be online or in_person");
        });

        it("requires a location when updating mode to in-person", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        mode: "in_person",
                        location: ""
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Location is required for in-person events");
        });

        it("rejects invalid structured coordinates", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        latitude: "91",
                        longitude: "-181"
                    }
                }
            );

            const messages = getValidationMessages(errors);

            expect(messages).toContain("Latitude must be between -90 and 90");
            expect(messages).toContain("Longitude must be between -180 and 180");
        });
    });

    /* =============================
       NULLABLE UPDATE FIELDS
    ============================= */

    describe("Nullable update fields", () => {
        it("converts an empty maximum participant value to null", async () => {
            const { errors, req } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        maxParticipants: ""
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.body.maxParticipants).toBeNull();
        });

        it("accepts a valid maximum participant value", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        maxParticipants: "20"
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it.each([
            ["zero", "0"],
            ["negative", "-1"],
            ["decimal", "2.5"],
            ["non-numeric", "invalid"]
        ])(
            "rejects a %s maximum participant update",
            async (_, maxParticipants) => {
                const { errors } = await runValidation(
                    updateEventValidator,
                    {
                        body: {
                            maxParticipants
                        }
                    }
                );

                expect(getValidationMessages(errors)).toContain("Max participants must be a positive integer");
            }
        );

        it("converts an empty registration deadline to null", async () => {
            const { errors, req } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        registrationDeadline: ""
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.body.registrationDeadline).toBeNull();
        });

        it("rejects an invalid registration deadline update", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        registrationDeadline: "invalid"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Registration deadline must be a valid ISO8601 date");
        });

        it("rejects an updated deadline after the updated start date", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        startDateTime: "2026-12-31T10:00:00.000Z",
                        registrationDeadline:
                            "2026-12-31T11:00:00.000Z"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Registration deadline must be before event start date");
        });
    });

    /* =============================
       UPDATE DATE VALIDATION
    ============================= */

    describe("Update date validation", () => {
        it("rejects an invalid start date", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        startDateTime: "invalid"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Start date and time must be a valid ISO8601 date");
        });

        it("rejects an invalid end date", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        endDateTime: "invalid"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain(
                "End date and time must be a valid ISO8601 date"
            );
        });

        it("rejects an end date before the updated start date", async () => {
            const { errors } = await runValidation(
                updateEventValidator,
                {
                    body: {
                        startDateTime: "2026-12-31T10:00:00.000Z",
                        endDateTime: "2026-12-31T09:00:00.000Z"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("End date and time must be after start date and time");
        });
    });

    /* =============================
       EVENT LISTING QUERY
    ============================= */

    describe("getAllEventsValidator", () => {
        it("accepts an empty event query", async () => {
            const { errors } = await runValidation(
                getAllEventsValidator
            );

            expect(errors).toHaveLength(0);
        });

        it("accepts and sanitizes valid event filters", async () => {
            const { errors, req } = await runValidation(
                getAllEventsValidator,
                {
                    query: {
                        creatorId: "12",
                        search: "  community  ",
                        type: "  Meetup  ",
                        theme: "  Technology  ",
                        mode: "in_person",
                        location: "  Montreal  ",
                        city: "  Montreal  ",
                        region: "  Quebec  ",
                        country: "  Canada  ",
                        date: "2026-12-31",
                        startDate: "2026-12-01",
                        endDate: "2026-12-31",
                        sortBy: "creatorId",
                        status: "upcoming",
                        page: "2",
                        pageSize: "20",
                        order: "DESC"
                    }
                }
            );

            expect(errors).toHaveLength(0);

            expect(req.query).toMatchObject({
                creatorId: 12,
                search: "community",
                type: "Meetup",
                theme: "Technology",
                location: "Montreal",
                city: "Montreal",
                region: "Quebec",
                country: "Canada",
                page: 2,
                pageSize: 20,
                order: "desc"
            });
        });

        it.each([
            [
                "creator ID",
                { creatorId: "0" },
                "Creator ID must be a positive integer"
            ],
            [
                "mode",
                { mode: "hybrid" },
                "Mode must be online or in_person"
            ],
            [
                "status",
                { status: "cancelled" },
                "Status must be upcoming, ongoing or past"
            ],
            [
                "sort field",
                { sortBy: "invalid" },
                "Invalid sort field"
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
                "sort order",
                { order: "random" },
                "Order must be asc or desc"
            ],
            [
                "date",
                { date: "invalid" },
                "Date must be a valid ISO8601 date"
            ]
        ])(
            "rejects an invalid %s filter",
            async (_, query, expectedMessage) => {
                const { errors } = await runValidation(
                    getAllEventsValidator,
                    { query }
                );

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );
    });
});
