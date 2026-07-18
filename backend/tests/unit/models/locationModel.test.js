/* =============================
   MOCK FUNCTIONS
============================= */

const mockLocationModel = {
    name: "LocationModel"
};

const mockDefine = jest.fn(() => mockLocationModel);

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/config/database", () => ({
    define: mockDefine
}));

/* =============================
   TEST IMPORTS
============================= */

const { DataTypes } = require("sequelize");

const Location = require("../../../src/models/locationModel");

/* ==========================================================================
   Location Model Unit Tests

   Tests the Location Sequelize model definition.

   Responsibilities
   - Test model registration
   - Test cached query fields
   - Test structured address fields
   - Test coordinate requirements
   - Test provider defaults
   - Test model options
   - Test location cache indexes

   Notes
   - The Sequelize database instance is mocked.
   - The model stores cached geocoding provider results.
=========================================================================== */

describe("location model", () => {
    const [
        modelName,
        attributes,
        options
    ] = mockDefine.mock.calls[0];

    /* =============================
       MODEL DEFINITION
    ============================= */

    describe("Model definition", () => {
        it("registers the Location model", () => {
            expect(mockDefine).toHaveBeenCalledTimes(1);

            expect(modelName).toBe("Location");
            expect(Location).toBe(mockLocationModel);
        });
    });

    /* =============================
       CACHE IDENTIFIERS
    ============================= */

    describe("Cache identifiers", () => {
        it("defines an auto-incrementing primary key", () => {
            expect(attributes.id).toEqual({
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            });
        });

        it.each([
            "query",
            "label"
        ])(
            "defines the required %s field", (field) => {
                expect(attributes[field]).toEqual({
                    type: DataTypes.STRING,
                    allowNull: false
                });
            }
        );
    });

    /* =============================
       STRUCTURED ADDRESS
    ============================= */

    describe("Structured address", () => {
        it.each([
            "streetAddress",
            "city",
            "region",
            "postalCode",
            "country"
        ])(
            "defines the optional %s field", (field) => {
                expect(attributes[field]).toEqual({
                    type: DataTypes.STRING,
                    allowNull: true
                });
            }
        );
    });

    /* =============================
       COORDINATES
    ============================= */

    describe("Coordinates", () => {
        it.each([
            "latitude",
            "longitude"
        ])(
            "defines the required %s coordinate", (field) => {
                expect(attributes[field]).toEqual({
                    type: DataTypes.DOUBLE,
                    allowNull: false
                });
            }
        );
    });

    /* =============================
       PROVIDER
    ============================= */

    describe("Provider", () => {
        it("defines a required provider with a Nominatim default", () => {
            expect(attributes.provider).toEqual({
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "nominatim"
            });
        });
    });

    /* =============================
       MODEL OPTIONS
    ============================= */

    describe("Model options", () => {
        it("uses the locations table with timestamps", () => {
            expect(options.tableName).toBe("locations");
            expect(options.timestamps).toBe(true);
        });
    });

    /* =============================
       MODEL INDEXES
    ============================= */

    describe("Model indexes", () => {
        it("defines a unique cache identity index", () => {
            expect(options.indexes).toContainEqual({
                unique: true,
                fields: [
                    "query",
                    "provider",
                    "latitude",
                    "longitude"
                ]
            });
        });

        it.each([
            ["query", ["query"]],
            ["provider", ["provider"]],
            ["city", ["city"]],
            ["region", ["region"]],
            ["country", ["country"]]
        ])(
            "defines an index for %s lookups", (_, fields) => {
                expect(options.indexes).toContainEqual({
                    fields
                });
            }
        );

        it("defines the expected number of indexes", () => {
            expect(options.indexes).toHaveLength(6);
        });
    });
});
