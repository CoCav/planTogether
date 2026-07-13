const { DataTypes } = require("sequelize");

const mockEventLikeModel = {
    name: "EventLikeModel"
};

const mockDefine = jest.fn(() => mockEventLikeModel);

const EventLike = require("../../../../src/models/associations/eventLikeModel");

/* ==========================================================================
   Event Like Model Unit Tests

   Tests the EventLike Sequelize model definition.

   Responsibilities
   - Test model registration
   - Test event and user foreign key fields
   - Test table and timestamp options
   - Test the unique event-user constraint
   - Test event like indexes

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

describe("event like model", () => {
    const [
        modelName,
        attributes,
        options
    ] = mockDefine.mock.calls[0];

    /* =============================
       MODEL DEFINITION
    ============================= */

    describe("Model definition", () => {
        it("registers the EventLike model", () => {
            expect(mockDefine).toHaveBeenCalledTimes(1);

            expect(modelName).toBe("EventLike");
            expect(EventLike).toBe(mockEventLikeModel);
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

        it("defines only event and user identifiers", () => {
            expect(Object.keys(attributes)).toEqual([
                "eventId",
                "userId"
            ]);
        });
    });

    /* =============================
       MODEL OPTIONS
    ============================= */

    describe("Model options", () => {
        it("uses the event_likes table with timestamps", () => {
            expect(options.tableName).toBe("event_likes");
            expect(options.timestamps).toBe(true);
        });
    });

    /* =============================
       MODEL INDEXES
    ============================= */

    describe("Model indexes", () => {
        it("prevents duplicate likes for the same event and user", () => {
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
