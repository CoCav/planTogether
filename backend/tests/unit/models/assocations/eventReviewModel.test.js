const { DataTypes } = require("sequelize");

const mockEventReviewModel = {
    name: "EventReviewModel"
};

const mockDefine = jest.fn(() => mockEventReviewModel);

const EventReview = require("../../../../src/models/associations/eventReviewModel");

/* ==========================================================================
   Event Review Model Unit Tests

   Tests the EventReview Sequelize model definition.

   Responsibilities
   - Test model registration
   - Test event and user foreign key fields
   - Test rating validation
   - Test review comment requirements
   - Test table and timestamp options
   - Test the unique event-user constraint
   - Test review indexes

   Notes
   - The Sequelize database instance is mocked.
   - Model associations are registered separately in models/index.js.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/config/database", () => ({
    define: mockDefine
}));

describe("event review model", () => {
    const [
        modelName,
        attributes,
        options
    ] = mockDefine.mock.calls[0];

    /* =============================
       MODEL DEFINITION
    ============================= */

    describe("Model definition", () => {
        it("registers the EventReview model", () => {
            expect(mockDefine).toHaveBeenCalledTimes(1);

            expect(modelName).toBe("EventReview");
            expect(EventReview).toBe(mockEventReviewModel);
        });
    });

    /* =============================
       MODEL ATTRIBUTES
    ============================= */

    describe("Model attributes", () => {
        it("defines the required event ID field", () => {
            expect(attributes.eventId).toEqual({
                type: DataTypes.INTEGER,
                allowNull: false
            });
        });

        it("defines the required user ID field", () => {
            expect(attributes.userId).toEqual({
                type: DataTypes.INTEGER,
                allowNull: false
            });
        });

        it("defines a required rating between 1 and 5", () => {
            expect(attributes.rating).toEqual({
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 5
                }
            });
        });

        it("defines a required review comment", () => {
            expect(attributes.comment).toEqual({
                type: DataTypes.TEXT,
                allowNull: false
            });
        });

        it("defines only the expected review attributes", () => {
            expect(Object.keys(attributes)).toEqual([
                "eventId",
                "userId",
                "rating",
                "comment"
            ]);
        });
    });

    /* =============================
       MODEL OPTIONS
    ============================= */

    describe("Model options", () => {
        it("uses the event_reviews table with timestamps", () => {
            expect(options.tableName).toBe("event_reviews");
            expect(options.timestamps).toBe(true);
        });
    });

    /* =============================
       MODEL INDEXES
    ============================= */

    describe("Model indexes", () => {
        it("prevents duplicate reviews for the same event and user", () => {
            expect(options.indexes).toContainEqual({
                unique: true,
                fields: [
                    "eventId",
                    "userId"
                ]
            });
        });

        it.each([
            ["event ID", ["eventId"]],
            ["user ID", ["userId"]],
            ["creation date", ["createdAt"]]
        ])("defines an index for %s queries",
            (_, fields) => {
                expect(options.indexes).toContainEqual({
                    fields
                });
            }
        );

        it("defines the expected number of indexes", () => {
            expect(options.indexes).toHaveLength(4);
        });
    });
});
