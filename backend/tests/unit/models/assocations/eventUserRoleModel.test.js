const { DataTypes } = require("sequelize");

const {
    EVENT_ROLES,
    EVENT_ROLE_VALUES
} = require("../../../../src/constants/eventRoles");

const mockEventUserRoleModel = {
    name: "EventUserRoleModel"
};

const mockDefine = jest.fn(() => mockEventUserRoleModel);

const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

/* ==========================================================================
   Event User Role Model Unit Tests

   Tests the EventUserRole Sequelize model definition.

   Responsibilities
   - Test model registration
   - Test event and user foreign key fields
   - Test supported membership roles
   - Test membership role defaults
   - Test join date tracking
   - Test soft-deleted membership fields
   - Test the unique event-user constraint
   - Test membership indexes

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

describe("event user role model", () => {
    const [
        modelName,
        attributes,
        options
    ] = mockDefine.mock.calls[0];

    /* =============================
       MODEL DEFINITION
    ============================= */

    describe("Model definition", () => {
        it("registers the EventUserRole model", () => {
            expect(mockDefine).toHaveBeenCalledTimes(1);

            expect(modelName).toBe("EventUserRole");
            expect(EventUserRole).toBe(mockEventUserRoleModel);
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

        it("defines all supported event membership roles", () => {
            expect(attributes.role.type.values).toEqual(EVENT_ROLE_VALUES);

            expect(attributes.role.allowNull).toBe(false);
        });

        it("defaults new memberships to participant role", () => {
            expect(attributes.role.defaultValue).toBe(EVENT_ROLES.PARTICIPANT);
        });

        it("defines a required join date with a current time default", () => {
            expect(attributes.joinedAt).toEqual({
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            });
        });

        it("defines an optional soft-deletion date", () => {
            expect(attributes.deletedAt).toEqual({
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            });
        });

        it("defines only the expected membership attributes", () => {
            expect(Object.keys(attributes)).toEqual([
                "eventId",
                "userId",
                "role",
                "joinedAt",
                "deletedAt"
            ]);
        });
    });

    /* =============================
       MODEL OPTIONS
    ============================= */

    describe("Model options", () => {
        it("uses the event_user_roles table", () => {
            expect(options.tableName).toBe("event_user_roles");
        });
    });

    /* =============================
       MODEL INDEXES
    ============================= */

    describe("Model indexes", () => {
        it("prevents duplicate memberships for the same event and user", () => {
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
            ["membership role", ["role"]],
            ["event and role", ["eventId", "role"]],
            ["user and role", ["userId", "role"]]
        ])(
            "defines an index for %s queries",
            (_, fields) => {
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
