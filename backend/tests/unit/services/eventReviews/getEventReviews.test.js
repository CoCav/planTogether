/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindEventByIdOrFail = jest.fn();
const mockBuildPublicUserInclude = jest.fn();

const mockGetPaginationOptions = jest.fn();
const mockGetTotalCount = jest.fn();
const mockGetTotalPages = jest.fn();

const mockFn = jest.fn();
const mockCol = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("sequelize", () => ({
    fn: mockFn,
    col: mockCol
}));

jest.mock("../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    name: "EventUserRole"
}));

jest.mock("../../../../src/models/associations/eventReviewModel", () => ({
    findAndCountAll: jest.fn(),
    findOne: jest.fn()
}));

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    isEventPast: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: jest.fn()
}));

jest.mock("../../../../src/utils/eventReviews/eventReviewsQueries", () => ({
    findReviewByIdOrFail: jest.fn()
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: jest.fn()
}));

jest.mock("../../../../src/utils/users/userInclude", () => ({
    buildPublicUserInclude: mockBuildPublicUserInclude
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: mockGetPaginationOptions,
    getTotalCount: mockGetTotalCount,
    getTotalPages: mockGetTotalPages
}));

/* =============================
   TEST IMPORTS
============================= */

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventReview = require("../../../../src/models/associations/eventReviewModel");

const { getEventReviews } = require("../../../../src/services/eventReviewService");

/* ==========================================================================
   Get Event Reviews Service Unit Tests

   Tests paginated event review retrieval.

   Responsibilities
   - Test event existence validation
   - Test pagination option delegation
   - Test review query composition
   - Test public user inclusion
   - Test review count normalization
   - Test total page calculation
   - Test average rating calculation
   - Test query error propagation

   Notes
   - Event queries, pagination helpers and user include helpers are mocked.
   - Sequelize aggregation functions are mocked.
=========================================================================== */

describe("get event reviews service", () => {
    let publicUserInclude;

    beforeEach(() => {
        jest.clearAllMocks();

        publicUserInclude = {
            model: User,
            as: "user",
            attributes: [
                "id",
                "name",
                "avatar"
            ]
        };

        mockFindEventByIdOrFail.mockResolvedValue({
            id: 1
        });

        mockBuildPublicUserInclude.mockReturnValue(publicUserInclude);

        mockGetPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        mockGetTotalCount.mockReturnValue(2);
        mockGetTotalPages.mockReturnValue(1);

        mockCol.mockReturnValue("rating-column");
        mockFn.mockReturnValue("average-expression");

        EventReview.findAndCountAll.mockResolvedValue({
            count: 2,
            rows: [
                {
                    id: 1,
                    rating: 5,
                    comment: "Great event!"
                },
                {
                    id: 2,
                    rating: 4,
                    comment: "Very good"
                }
            ]
        });

        EventReview.findOne.mockResolvedValue({
            averageRating: "4.5000000000000000"
        });
    });

    /* =============================
       REVIEW RETRIEVAL
    ============================= */

    describe("getEventReviews", () => {
        it("returns paginated reviews with average rating metadata", async () => {
            const query = {
                page: "1",
                pageSize: "10",
                sortBy: "createdAt",
                order: "desc"
            };

            const result = await getEventReviews(1, query);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledTimes(1);
            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(Event, 1);

            expect(mockGetPaginationOptions).toHaveBeenCalledTimes(1);
            expect(mockGetPaginationOptions).toHaveBeenCalledWith(
                query,
                [
                    "createdAt",
                    "rating"
                ],
                "createdAt",
                "DESC"
            );

            expect(mockBuildPublicUserInclude).toHaveBeenCalledWith(User);

            expect(EventReview.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    eventId: 1
                },
                include: [
                    publicUserInclude
                ],
                order: [
                    [
                        "createdAt",
                        "DESC"
                    ]
                ],
                limit: 10,
                offset: 0
            });

            expect(mockGetTotalCount).toHaveBeenCalledWith(2);

            expect(mockFn).toHaveBeenCalledWith("AVG", "rating-column");
            expect(mockCol).toHaveBeenCalledWith("rating");

            expect(EventReview.findOne).toHaveBeenCalledWith({
                where: {
                    eventId: 1
                },
                attributes: [
                    [
                        "average-expression",
                        "averageRating"
                    ]
                ],
                raw: true
            });

            expect(mockGetTotalPages).toHaveBeenCalledWith(2, 10);

            expect(result).toEqual({
                page: 1,
                pageSize: 10,
                totalReviews: 2,
                totalPages: 1,
                averageRating: 4.5,
                reviews: [{
                    id: 1,
                    rating: 5,
                    comment: "Great event!"
                }, {
                    id: 2,
                    rating: 4,
                    comment: "Very good"
                }]
            });
        });

        it("forwards custom pagination and sorting options to the review query", async () => {
            const query = {
                page: "2",
                pageSize: "5",
                sortBy: "rating",
                order: "asc"
            };

            mockGetPaginationOptions.mockReturnValue({
                page: 2,
                pageSize: 5,
                limit: 5,
                offset: 5,
                orderField: "rating",
                orderDirection: "ASC"
            });

            mockGetTotalCount.mockReturnValue(12);
            mockGetTotalPages.mockReturnValue(3);

            await getEventReviews(1, query);

            expect(EventReview.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: [
                        [
                            "rating",
                            "ASC"
                        ]
                    ],
                    limit: 5,
                    offset: 5
                })
            );

            expect(mockGetTotalPages).toHaveBeenCalledWith(12, 5);
        });
    });

    /* =============================
       REVIEW COUNT
    ============================= */

    describe("Review count", () => {
        it("normalizes grouped Sequelize counts through the pagination helper", async () => {
            const groupedCount = [{
                count: "2"
            }, {
                count: "3"
            }];

            EventReview.findAndCountAll.mockResolvedValue({
                count: groupedCount,
                rows: []
            });

            mockGetTotalCount.mockReturnValue(5);
            mockGetTotalPages.mockReturnValue(1);

            const result = await getEventReviews(1);

            expect(mockGetTotalCount).toHaveBeenCalledWith(groupedCount);

            expect(result.totalReviews).toBe(5);
        });
    });

    /* =============================
       AVERAGE RATING
    ============================= */

    describe("Average rating", () => {
        it.each([[
            "rounds a numeric string to one decimal",
            {
                averageRating: "4.6666666666666667"
            },
            4.7
        ], [
            "returns null for a null average",
            {
                averageRating: null
            },
            null
        ], [
            "returns null for a missing result",
            null,
            null
        ], [
            "returns null for a missing average value",
            {},
            null
        ]])(
            "%s", async (_, averageResult, expected) => {
                EventReview.findOne.mockResolvedValue(averageResult);

                const result = await getEventReviews(1);

                expect(result.averageRating).toBe(expected);
            }
        );
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("stops review retrieval when the event does not exist", async () => {
            const error = Object.assign(new Error("Event not found"), {
                statusCode: 404
            });

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(getEventReviews(999)).rejects.toBe(error);

            expect(mockGetPaginationOptions).not.toHaveBeenCalled();

            expect(EventReview.findAndCountAll).not.toHaveBeenCalled();
            expect(EventReview.findOne).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it.each([[
            "review retrieval", () => {
                EventReview.findAndCountAll
                    .mockRejectedValue(
                        new Error("Review retrieval failed")
                    );
            }], [
            "average rating retrieval", () => {
                EventReview.findOne.mockRejectedValue(
                    new Error("Average rating failed")
                );
            }]
        ])(
            "propagates %s errors", async (_, configureError) => {
                configureError();

                await expect(getEventReviews(1)).rejects.toBeInstanceOf(Error);
            }
        );
    });
});
