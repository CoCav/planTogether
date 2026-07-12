const { Op } = require("sequelize");

const { EVENT_ROLES } = require("../../../../../src/constants/eventRoles");

const {
    getPublicCreatedEvents,
    getPublicJoinedEvents
} = require("../../../../../src/utils/users/public/publicUserEventQueries");

/* ==========================================================================
   Public User Event Query Utility Unit Tests

   Tests public user event query helpers.

   Responsibilities
   - Test created event query building
   - Test created event query result passthrough
   - Test joined event query building
   - Test active non-organizer membership filtering
   - Test joined membership event extraction
   - Test joined event count preservation

   Notes
   - Created events are queried directly from Event.
   - Joined events are queried through EventUserRole.
   - Participant count enrichment is handled by the user service.
=========================================================================== */

describe("public user event query utility", () => {
    const Event = {
        findAndCountAll: jest.fn()
    };

    const EventUserRole = {
        findAndCountAll: jest.fn()
    };

    const User = {
        name: "UserModel"
    };

    const buildEventCreatorInclude = jest.fn();

    const pagination = {
        limit: 10,
        offset: 0,
        orderField: "startDateTime",
        orderDirection: "ASC"
    };

    beforeEach(() => {
        jest.clearAllMocks();

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });
    });

    /* =============================
       CREATED EVENTS
    ============================= */

    describe("getPublicCreatedEvents", () => {
        it("queries paginated events created by the user", async () => {
            Event.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: []
            });

            const eventFilter = {
                theme: "Tech"
            };

            await getPublicCreatedEvents({
                Event,
                User,
                userId: 1,
                eventFilter,
                creator: "John",
                pagination,
                buildEventCreatorInclude
            });

            expect(buildEventCreatorInclude).toHaveBeenCalledWith(User, "John");

            expect(Event.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    creatorId: 1,
                    theme: "Tech"
                },
                include: [{
                    model: User,
                    as: "creator"
                }],
                limit: 10,
                offset: 0,
                order: [[
                    "startDateTime",
                    "ASC"
                ]],
                subQuery: false
            });
        });

        it("returns the created event query result unchanged", async () => {
            const queryResult = {
                count: 1,
                rows: [{
                    id: 1
                }]
            };

            Event.findAndCountAll.mockResolvedValue(queryResult);

            const result = await getPublicCreatedEvents({
                Event,
                User,
                userId: 1,
                eventFilter: {},
                creator: undefined,
                pagination,
                buildEventCreatorInclude
            });

            expect(result).toBe(queryResult);
        });

        it("supports empty event filters", async () => {
            Event.findAndCountAll.mockResolvedValue({
                count: 0,
                rows: []
            });

            await getPublicCreatedEvents({
                Event,
                User,
                userId: 5,
                eventFilter: {},
                creator: undefined,
                pagination,
                buildEventCreatorInclude
            });

            expect(Event.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        creatorId: 5
                    }
                })
            );
        });
    });

    /* =============================
       JOINED EVENTS
    ============================= */

    describe("getPublicJoinedEvents", () => {
        it("queries active non-organizer memberships", async () => {
            EventUserRole.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: []
            });

            const eventFilter = {
                theme: "React"
            };

            await getPublicJoinedEvents({
                Event,
                User,
                EventUserRole,
                userId: 1,
                eventFilter,
                creator: "Alice",
                pagination,
                buildEventCreatorInclude
            });

            expect(buildEventCreatorInclude).toHaveBeenCalledWith(User, "Alice");

            expect(EventUserRole.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                    deletedAt: null,
                    role: {
                        [Op.ne]: EVENT_ROLES.ORGANIZER
                    }
                },
                include: [{
                    model: Event,
                    as: "event",
                    where: {
                        theme: "React"
                    },
                    include: [{
                        model: User,
                        as: "creator"
                    }]
                }],
                limit: 10,
                offset: 0,
                order: [[
                    {
                        model: Event,
                        as: "event"
                    },
                    "startDateTime",
                    "ASC"
                ]],
                subQuery: false
            });
        });

        it("extracts events from membership rows", async () => {
            const eventA = {
                id: 1,
                title: "Joined Event A"
            };

            const eventB = {
                id: 2,
                title: "Joined Event B"
            };

            EventUserRole.findAndCountAll.mockResolvedValue({
                count: 2,
                rows: [{
                    event: eventA
                }, {
                    event: eventB
                }]
            });

            const result = await getPublicJoinedEvents({
                Event,
                User,
                EventUserRole,
                userId: 1,
                eventFilter: {},
                creator: undefined,
                pagination,
                buildEventCreatorInclude
            });

            expect(result).toEqual({
                count: 2,
                rows: [
                    eventA,
                    eventB
                ]
            });
        });

        it("preserves the joined event count", async () => {
            EventUserRole.findAndCountAll.mockResolvedValue({
                count: 5,
                rows: []
            });

            const result = await getPublicJoinedEvents({
                Event,
                User,
                EventUserRole,
                userId: 1,
                eventFilter: {},
                creator: undefined,
                pagination,
                buildEventCreatorInclude
            });

            expect(result).toEqual({
                count: 5,
                rows: []
            });
        });

        it("supports empty event filters", async () => {
            EventUserRole.findAndCountAll.mockResolvedValue({
                count: 0,
                rows: []
            });

            await getPublicJoinedEvents({
                Event,
                User,
                EventUserRole,
                userId: 1,
                eventFilter: {},
                creator: undefined,
                pagination,
                buildEventCreatorInclude
            });

            expect(EventUserRole.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: [
                        expect.objectContaining({
                            where: {}
                        })
                    ]
                })
            );
        });
    });
});
