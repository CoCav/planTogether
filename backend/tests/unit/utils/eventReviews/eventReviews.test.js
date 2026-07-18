const {
    buildEventReviewInclude,
    buildEventReviewCountAttribute,
    buildEventAverageRatingAttribute
} = require("../../../../src/utils/eventReviews/eventReviews");

/* ==========================================================================
   Event Review Utility Unit Tests

   Tests review include and aggregation attribute builders.

   Responsibilities
   - Test event review include building
   - Test distinct review count attribute building
   - Test rounded average rating attribute building
   - Test shared aggregation aliases

   Notes
   - Review counts use COUNT DISTINCT.
   - Average ratings are rounded to one decimal.
=========================================================================== */

describe("event review utility", () => {
    const EventReview = {
        name: "EventReviewModel"
    };

    const sequelize = {
        fn: jest.fn(),
        col: jest.fn(),
        cast: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT REVIEW INCLUDE
    ============================= */

    describe("buildEventReviewInclude", () => {
        it("builds the event review include", () => {
            const result = buildEventReviewInclude(EventReview);

            expect(result).toEqual({
                model: EventReview,
                as: "reviews",
                attributes: [],
                required: false
            });
        });
    });

    /* =============================
       REVIEW COUNT ATTRIBUTE
    ============================= */

    describe("buildEventReviewCountAttribute", () => {
        it("builds a distinct review count attribute", () => {
            const reviewColumn = {
                type: "column",
                path: "reviews.id"
            };

            const distinctExpression = {
                type: "distinct",
                value: reviewColumn
            };

            const countExpression = {
                type: "count",
                value: distinctExpression
            };

            sequelize.col.mockReturnValue(reviewColumn);

            sequelize.fn
                .mockReturnValueOnce(distinctExpression)
                .mockReturnValueOnce(countExpression);

            const result = buildEventReviewCountAttribute(sequelize, "reviews.id");

            expect(sequelize.col).toHaveBeenCalledWith("reviews.id");
            expect(sequelize.fn).toHaveBeenNthCalledWith(1, "DISTINCT", reviewColumn);
            expect(sequelize.fn).toHaveBeenNthCalledWith(2, "COUNT", distinctExpression);

            expect(result).toEqual([
                countExpression,
                "reviewCount"
            ]);
        });
    });

    /* =============================
       AVERAGE RATING ATTRIBUTE
    ============================= */

    describe("buildEventAverageRatingAttribute", () => {
        it("builds a rounded average rating attribute", () => {
            const ratingColumn = {
                type: "column",
                path: "reviews.rating"
            };

            const averageExpression = {
                type: "average",
                value: ratingColumn
            };

            const castExpression = {
                type: "cast",
                value: averageExpression,
                dataType: "numeric"
            };

            const roundedExpression = {
                type: "round",
                value: castExpression,
                precision: 1
            };

            sequelize.col.mockReturnValue(ratingColumn);

            sequelize.fn
                .mockReturnValueOnce(averageExpression)
                .mockReturnValueOnce(roundedExpression);

            sequelize.cast.mockReturnValue(castExpression);

            const result = buildEventAverageRatingAttribute(sequelize, "reviews.rating");

            expect(sequelize.col).toHaveBeenCalledWith("reviews.rating");
            expect(sequelize.fn).toHaveBeenNthCalledWith(1, "AVG", ratingColumn);

            expect(sequelize.cast).toHaveBeenCalledWith(averageExpression, "numeric");

            expect(sequelize.fn).toHaveBeenNthCalledWith(
                2,
                "ROUND",
                castExpression,
                1
            );

            expect(result).toEqual([
                roundedExpression,
                "averageRating"
            ]);
        });
    });
});
