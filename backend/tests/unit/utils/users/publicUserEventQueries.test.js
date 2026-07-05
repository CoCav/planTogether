/* ==================================================
   PUBLIC USER EVENT QUERIES TESTS

   Tests:
   - created event query building
   - created event query result passthrough
   - joined event query building
   - joined membership event extraction
   - joined event count preservation

   Ensures:
   - created view queries Event directly with filters and pagination
   - joined view queries EventUserRole with active non-organizer memberships
   - creator filtering is handled through includes
   - joined membership rows are normalized into event rows
   - shared event role constants are used correctly
================================================== */

const { Op } = require("sequelize");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { getPublicCreatedEvents, getPublicJoinedEvents } = require("../../../../src/utils/users/public/publicUserEventQueries");

describe("publicUserEventQueries utils", () => {

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

        it("should query paginated public created events", async () => {
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
                include: [
                    {
                        model: User,
                        as: "creator"
                    }
                ],
                limit: 10,
                offset: 0,
                order: [["startDateTime", "ASC"]],
                subQuery: false
            });
        });

        it("should return created event query result", async () => {
            const resultPayload = {
                count: 1,
                rows: [{ id: 1 }]
            };

            Event.findAndCountAll.mockResolvedValue(resultPayload);

            const result = await getPublicCreatedEvents({
                Event,
                User,
                userId: 1,
                eventFilter: {},
                creator: undefined,
                pagination,
                buildEventCreatorInclude
            });

            expect(result).toBe(resultPayload);
        });
    });

    /* =============================
       JOINED EVENTS
    ============================= */

    describe("getPublicJoinedEvents", () => {

        it("should query paginated public joined events through memberships", async () => {
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
                EVENT_ROLES,
                Op,
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
                    include: [
                        {
                            model: User,
                            as: "creator"
                        }
                    ]
                }],
                limit: 10,
                offset: 0,
                order: [[
                    { model: Event, as: "event" },
                    "startDateTime",
                    "ASC"
                ]],
                subQuery: false
            });
        });

        it("should extract events from joined membership rows", async () => {
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
                rows: [
                    { event: eventA },
                    { event: eventB }
                ]
            });

            const result = await getPublicJoinedEvents({
                Event,
                User,
                EventUserRole,
                EVENT_ROLES,
                Op,
                userId: 1,
                eventFilter: {},
                creator: undefined,
                pagination,
                buildEventCreatorInclude
            });

            expect(result).toEqual({
                count: 2,
                rows: [eventA, eventB]
            });
        });

        it("should preserve joined events count", async () => {
            EventUserRole.findAndCountAll.mockResolvedValue({
                count: 5,
                rows: []
            });

            const result = await getPublicJoinedEvents({
                Event,
                User,
                EventUserRole,
                EVENT_ROLES,
                Op,
                userId: 1,
                eventFilter: {},
                creator: undefined,
                pagination,
                buildEventCreatorInclude
            });

            expect(result.count).toBe(5);
            expect(result.rows).toEqual([]);
        });
    });
});
