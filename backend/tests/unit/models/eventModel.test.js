const { DataTypes } = require("sequelize");

const { EVENT_MODES } = require("../../../src/constants/eventModes");

const mockEventModel = {
    name: "EventModel"
};

const mockDefine = jest.fn(() => mockEventModel);

const Event = require("../../../src/models/eventModel");

/* ==========================================================================
   Event Model Unit Tests

   Tests the Event Sequelize model definition.

   Responsibilities
   - Test model registration
   - Test event metadata fields
   - Test scheduling fields
   - Test location fields
   - Test participant settings
   - Test model options
   - Test event indexes

   Notes
   - The Sequelize database instance is mocked.
   - Model associations are registered separately in models/index.js.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/config/database", () => ({
    define: mockDefine
}));

describe("event model", () => {
    const [
        modelName,
        attributes,
        options
    ] = mockDefine.mock.calls[0];

    /* =============================
       MODEL DEFINITION
    ============================= */

    describe("Model definition", () => {
        it("registers the Event model", () => {
            expect(mockDefine).toHaveBeenCalledTimes(1);

            expect(modelName).toBe("Event");
            expect(Event).toBe(mockEventModel);
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    describe("Event metadata", () => {
        it("defines the required creator ID", () => {
            expect(attributes.creatorId).toEqual({
                type: DataTypes.INTEGER,
                allowNull: false
            });
        });

        it.each([
            "title",
            "description",
            "type",
            "theme"
        ])("defines the required %s field",
            (field) => {
                expect(attributes[field].allowNull).toBe(false);
            }
        );

        it("defines supported event modes", () => {
            expect(attributes.mode.type.values).toEqual([
                EVENT_MODES.ONLINE,
                EVENT_MODES.IN_PERSON
            ]);

            expect(attributes.mode.defaultValue).toBe(EVENT_MODES.IN_PERSON);

            expect(attributes.mode.allowNull).toBe(false);
        });
    });

    /* =============================
       LOCATION FIELDS
    ============================= */

    describe("Location fields", () => {
        it.each([
            "location",
            "locationLabel",
            "streetAddress",
            "city",
            "region",
            "postalCode",
            "country"
        ])("defines the optional %s field",
            (field) => {
                expect(attributes[field].allowNull).toBe(true);

                expect(attributes[field].type).toBe(DataTypes.STRING);
            }
        );

        it.each([
            "latitude",
            "longitude"
        ])("defines the optional %s coordinate",
            (field) => {
                expect(attributes[field]).toEqual({
                    type: DataTypes.DOUBLE,
                    allowNull: true
                });
            }
        );
    });

    /* =============================
       SCHEDULING
    ============================= */

    describe("Scheduling", () => {
        it.each([
            "startDateTime",
            "endDateTime"
        ])(
            "defines the required %s field",
            (field) => {
                expect(attributes[field]).toEqual({
                    type: DataTypes.DATE,
                    allowNull: false
                });
            }
        );

        it("defines an optional registration deadline", () => {
            expect(attributes.registrationDeadline).toEqual({
                type: DataTypes.DATE,
                allowNull: true
            });
        });
    });

    /* =============================
       PARTICIPATION
    ============================= */

    describe("Participation", () => {
        it("defines an optional participant limit", () => {
            expect(attributes.maxParticipants).toEqual({
                type: DataTypes.INTEGER,
                allowNull: true
            });
        });

        it("defines an optional event image", () => {
            expect(attributes.image).toEqual({
                type: DataTypes.STRING,
                allowNull: true
            });
        });
    });

    /* =============================
       MODEL OPTIONS
    ============================= */

    describe("Model options", () => {
        it("uses the events table with timestamps", () => {
            expect(options.tableName).toBe("events");

            expect(options.timestamps).toBe(true);
        });
    });

    /* =============================
       MODEL INDEXES
    ============================= */

    describe("Model indexes", () => {
        it.each([
            ["creator", ["creatorId"]],
            ["start date", ["startDateTime"]],
            ["end date", ["endDateTime"]],
            ["mode", ["mode"]],
            ["type", ["type"]],
            ["theme", ["theme"]],
            ["location", ["location"]],
            ["location label", ["locationLabel"]],
            ["city", ["city"]],
            ["region", ["region"]],
            ["country", ["country"]],
            ["coordinates", ["latitude", "longitude"]]
        ])(
            "defines an index for %s queries",
            (_, fields) => {
                expect(options.indexes).toContainEqual({
                    fields
                });
            }
        );

        it("defines the expected number of indexes", () => {
            expect(options.indexes).toHaveLength(12);
        });
    });
});
