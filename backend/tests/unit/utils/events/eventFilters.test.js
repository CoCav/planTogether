const { Op } = require("sequelize");

const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const {
    addAndCondition,
    applyEventStatusFilter,
    applyEventDateFilters,
    applyEventSearchFilters,
    buildEventWhereConditions
} = require("../../../../src/utils/events/eventFilters");

const { mockSystemTime } = require("../../../helpers/mocks/systemTimeMockHelper");

/* ==========================================================================
   Event Filter Utility Unit Tests

   Tests reusable event filter builders.

   Responsibilities
   - Test AND condition helpers
   - Test status filters
   - Test date filters
   - Test search filters
   - Test complete where condition building

   Notes
   - Sequelize operators are asserted directly.
   - System time is mocked for deterministic status filtering.
=========================================================================== */

describe("event filter utility", () => {
    mockSystemTime("2026-04-25T12:00:00.000Z");

    /* =============================
       AND CONDITION
    ============================= */

    describe("addAndCondition", () => {
        it("creates an AND array when none exists", () => {
            const where = {};

            addAndCondition(where, {
                id: 1
            });

            expect(where).toEqual({
                [Op.and]: [{
                    id: 1
                }]
            });
        });

        it("appends conditions to an existing AND array", () => {
            const where = {
                [Op.and]: [{
                    creatorId: 10
                }]
            };

            addAndCondition(where, {
                mode: "online"
            });

            expect(where[Op.and]).toEqual([{
                creatorId: 10
            }, {
                mode: "online"
            }]);
        });

        it("supports multiple appended conditions", () => {
            const where = {};

            addAndCondition(where, {
                creatorId: 1
            });

            addAndCondition(where, {
                mode: "online"
            });

            addAndCondition(where, {
                theme: "Tech"
            });

            expect(where[Op.and]).toHaveLength(3);
        });

    });

    /* =============================
       EVENT STATUS FILTER
    ============================= */

    describe("applyEventStatusFilter", () => {
        it("does not modify conditions when status is omitted", () => {
            const where = {};

            applyEventStatusFilter(where);

            expect(where).toEqual({});
        });

        it("adds an upcoming event condition", () => {
            const where = {};

            applyEventStatusFilter(where, EVENT_STATUS.UPCOMING);

            expect(where).toEqual({
                [Op.and]: [{
                    startDateTime: {
                        [Op.gt]: new Date("2026-04-25T12:00:00.000Z")
                    }
                }]
            });
        });

        it("adds ongoing event conditions", () => {
            const where = {};

            applyEventStatusFilter(where, EVENT_STATUS.ONGOING);

            expect(where).toEqual({
                [Op.and]: [{
                    startDateTime: {
                        [Op.lte]: new Date(
                            "2026-04-25T12:00:00.000Z"
                        )
                    }
                }, {
                    endDateTime: {
                        [Op.gte]: new Date("2026-04-25T12:00:00.000Z")
                    }
                }]
            });
        });

        it("adds a past event condition", () => {
            const where = {};

            applyEventStatusFilter(where, EVENT_STATUS.PAST);

            expect(where).toEqual({
                [Op.and]: [{
                    endDateTime: {
                        [Op.lt]: new Date("2026-04-25T12:00:00.000Z")
                    }
                }]
            });
        });

        it("preserves existing AND conditions", () => {
            const existingCondition = {
                creatorId: 10
            };

            const where = {
                [Op.and]: [
                    existingCondition
                ]
            };

            applyEventStatusFilter(where, EVENT_STATUS.UPCOMING);

            expect(where[Op.and]).toEqual([
                existingCondition,
                {
                    startDateTime: {
                        [Op.gt]: new Date("2026-04-25T12:00:00.000Z")
                    }
                }
            ]);
        });

        it("does not modify conditions for an unsupported status", () => {
            const where = {};

            applyEventStatusFilter(where, "cancelled");

            expect(where).toEqual({});
        });
    });

    /* =============================
       EVENT DATE FILTERS
    ============================= */

    describe("applyEventDateFilters", () => {
        it("does not modify conditions when date filters are omitted", () => {
            const where = {};

            applyEventDateFilters(where, {});

            expect(where).toEqual({});
        });

        it("adds overlap conditions for a single date", () => {
            const where = {};

            applyEventDateFilters(where, {
                date: "2026-04-25"
            });

            expect(where).toEqual({
                [Op.and]: [{
                    startDateTime: {
                        [Op.lte]: new Date("2026-04-25T23:59:59.999")
                    }
                }, {
                    endDateTime: {
                        [Op.gte]: new Date("2026-04-25T00:00:00.000")
                    }
                }]
            });
        });

        it("prioritizes the single date filter over a date range", () => {
            const where = {};

            applyEventDateFilters(where, {
                date: "2026-04-25",
                startDate: "2026-04-01",
                endDate: "2026-04-30"
            });

            expect(where[Op.and]).toEqual([{
                startDateTime: {
                    [Op.lte]: new Date("2026-04-25T23:59:59.999")
                }
            }, {
                endDateTime: {
                    [Op.gte]: new Date("2026-04-25T00:00:00.000")
                }
            }]);
        });

        it("adds overlap conditions for a complete date range", () => {
            const where = {};

            applyEventDateFilters(where, {
                startDate: "2026-04-20",
                endDate: "2026-04-30"
            });

            expect(where).toEqual({
                [Op.and]: [{
                    startDateTime: {
                        [Op.lte]: new Date("2026-04-30T23:59:59.999")
                    }
                }, {
                    endDateTime: {
                        [Op.gte]: new Date("2026-04-20T00:00:00.000")
                    }
                }]
            });
        });

        it("adds a lower bound when only startDate is provided", () => {
            const where = {};

            applyEventDateFilters(where, {
                startDate: "2026-04-20"
            });

            expect(where).toEqual({
                [Op.and]: [{
                    startDateTime: {
                        [Op.gte]: new Date("2026-04-20T00:00:00.000")
                    }
                }]
            });
        });

        it("adds an upper bound when only endDate is provided", () => {
            const where = {};

            applyEventDateFilters(where, {
                endDate: "2026-04-30"
            });

            expect(where).toEqual({
                [Op.and]: [{
                    startDateTime: {
                        [Op.lte]: new Date("2026-04-30T23:59:59.999")
                    }
                }]
            });
        });

        it("preserves existing AND conditions", () => {
            const existingCondition = {
                creatorId: 10
            };

            const where = {
                [Op.and]: [
                    existingCondition
                ]
            };

            applyEventDateFilters(where, {
                startDate: "2026-04-20"
            });

            expect(where[Op.and]).toEqual([
                existingCondition, {
                    startDateTime: {
                        [Op.gte]: new Date("2026-04-20T00:00:00.000")
                    }
                }
            ]);
        });
    });

    /* =============================
       EVENT SEARCH FILTERS
    ============================= */

    describe("applyEventSearchFilters", () => {
        it("does not modify conditions when query filters are omitted", () => {
            const where = {};

            applyEventSearchFilters(where);

            expect(where).toEqual({});
        });

        it("adds creator, mode, type and theme filters", () => {
            const where = {};

            applyEventSearchFilters(where, {
                creatorId: "12",
                mode: "  online  ",
                type: "Meetup",
                theme: "Technology"
            });

            expect(where).toEqual({
                creatorId: 12,
                mode: "online",
                type: {
                    [Op.iLike]: "%Meetup%"
                },
                theme: {
                    [Op.iLike]: "%Technology%"
                }
            });
        });

        it("adds structured location filters", () => {
            const where = {};

            applyEventSearchFilters(where, {
                city: "Montreal",
                region: "Quebec",
                country: "Canada"
            });

            expect(where).toEqual({
                city: {
                    [Op.iLike]: "%Montreal%"
                },
                region: {
                    [Op.iLike]: "%Quebec%"
                },
                country: {
                    [Op.iLike]: "%Canada%"
                }
            });
        });

        it("builds a broad location search across location fields", () => {
            const where = {};

            applyEventSearchFilters(where, {
                location: "  Montreal  "
            });

            expect(where).toEqual({
                [Op.and]: [{
                    [Op.or]: [{
                        location: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        locationLabel: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        streetAddress: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        city: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        region: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        country: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }]
                }]
            });
        });

        it.each([
            ["missing", undefined],
            ["empty", ""],
            ["whitespace-only", "   "]
        ])(
            "does not add a broad location filter for a %s value",
            (_, location) => {
                const where = {};

                applyEventSearchFilters(where, {
                    location
                });

                expect(where).toEqual({});
            }
        );

        it("adds a title and description search filter", () => {
            const where = {};

            applyEventSearchFilters(where, {
                search: "community"
            });

            expect(where).toEqual({
                [Op.or]: [{
                    title: {
                        [Op.iLike]: "%community%"
                    }
                }, {
                    description: {
                        [Op.iLike]: "%community%"
                    }
                }]
            });
        });

        it("combines location and text search filters", () => {
            const where = {};

            applyEventSearchFilters(where, {
                location: "Montreal",
                search: "community"
            });

            expect(where).toEqual({
                [Op.and]: [{
                    [Op.or]: [{
                        location: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        locationLabel: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        streetAddress: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        city: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        region: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        country: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }]
                }],
                [Op.or]: [{
                    title: {
                        [Op.iLike]: "%community%"
                    }
                }, {
                    description: {
                        [Op.iLike]: "%community%"
                    }
                }]
            });
        });

        it("preserves existing conditions", () => {
            const where = {
                status: "active",
                [Op.and]: [{
                    creatorId: 10
                }]
            };

            applyEventSearchFilters(where, {
                mode: "online",
                location: "Montreal"
            });

            expect(where).toEqual({
                status: "active",
                mode: "online",
                [Op.and]: [{
                    creatorId: 10
                }, {
                    [Op.or]: [{
                        location: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        locationLabel: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        streetAddress: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        city: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        region: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }, {
                        country: {
                            [Op.iLike]: "%Montreal%"
                        }
                    }]
                }]
            });
        });
    });

    /* =============================
       EVENT WHERE CONDITIONS
    ============================= */

    describe("buildEventWhereConditions", () => {
        it("returns the provided where conditions object", () => {
            const where = {};

            const result = buildEventWhereConditions(
                where,
                {}
            );

            expect(result).toBe(where);
        });

        it("builds status, date and search conditions together", () => {
            const where = {};

            const result = buildEventWhereConditions(
                where,
                {
                    status: EVENT_STATUS.UPCOMING,
                    startDate: "2026-04-26",
                    mode: "online",
                    search: "community"
                }
            );

            expect(result).toEqual({
                mode: "online",
                [Op.and]: [{
                    startDateTime: {
                        [Op.gt]: new Date("2026-04-25T12:00:00.000Z")
                    }
                }, {
                    startDateTime: {
                        [Op.gte]: new Date("2026-04-26T00:00:00.000")
                    }
                }],
                [Op.or]: [{
                    title: {
                        [Op.iLike]: "%community%"
                    }
                }, {
                    description: {
                        [Op.iLike]: "%community%"
                    }
                }]
            });
        });

        it("excludes status filtering when includeStatus is false", () => {
            const where = {};

            const result = buildEventWhereConditions(
                where,
                {
                    status: EVENT_STATUS.PAST,
                    mode: "online"
                },
                {
                    includeStatus: false
                }
            );

            expect(result).toEqual({
                mode: "online"
            });

            expect(result).not.toHaveProperty(Op.and);
        });

        it("applies status filtering by default", () => {
            const where = {};

            buildEventWhereConditions(
                where,
                {
                    status: EVENT_STATUS.PAST
                }
            );

            expect(where).toEqual({
                [Op.and]: [{
                    endDateTime: {
                        [Op.lt]: new Date("2026-04-25T12:00:00.000Z")
                    }
                }]
            });
        });

        it("preserves existing conditions while adding query filters", () => {
            const existingCondition = {
                archivedAt: null
            };

            const where = {
                [Op.and]: [
                    existingCondition
                ]
            };

            const result = buildEventWhereConditions(
                where,
                {
                    status: EVENT_STATUS.ONGOING,
                    city: "Montreal"
                }
            );

            expect(result).toEqual({
                city: {
                    [Op.iLike]: "%Montreal%"
                },
                [Op.and]: [
                    existingCondition,
                    {
                        startDateTime: {
                            [Op.lte]: new Date("2026-04-25T12:00:00.000Z")
                        }
                    },
                    {
                        endDateTime: {
                            [Op.gte]: new Date("2026-04-25T12:00:00.000Z")
                        }
                    }
                ]
            });
        });

        it("supports an empty query with status filtering disabled", () => {
            const where = {};

            const result = buildEventWhereConditions(
                where,
                {},
                {
                    includeStatus: false
                }
            );

            expect(result).toEqual({});
        });
    });
});
