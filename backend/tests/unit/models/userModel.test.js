/* =============================
   MOCK FUNCTIONS
============================= */

const mockUserModel = {
    name: "UserModel"
};

const mockDefine = jest.fn(() => mockUserModel);

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/config/database", () => ({
    define: mockDefine
}));

jest.mock("../../../src/utils/stringNormalizer", () => ({
    normalizeEmail: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const { DataTypes } = require("sequelize");

const User = require("../../../src/models/userModel");

const { normalizeEmail } = require("../../../src/utils/stringNormalizer");

/* ==========================================================================
   User Model Unit Tests

   Tests the User Sequelize model definition.

   Responsibilities
   - Test model registration
   - Test user account fields
   - Test email validation and normalization
   - Test password visibility scopes
   - Test avatar and soft-deletion fields
   - Test model options

   Notes
   - The Sequelize database instance is mocked.
   - Email normalization is delegated to stringNormalizer.
=========================================================================== */

describe("user model", () => {
    const [
        modelName,
        attributes,
        options
    ] = mockDefine.mock.calls[0];

    /* =============================
       MODEL DEFINITION
    ============================= */

    describe("Model definition", () => {
        it("registers the User model", () => {
            expect(mockDefine).toHaveBeenCalledTimes(1);

            expect(modelName).toBe("User");
            expect(User).toBe(mockUserModel);
        });
    });

    /* =============================
       USER ATTRIBUTES
    ============================= */

    describe("User attributes", () => {
        it("defines an auto-incrementing primary key", () => {
            expect(attributes.id).toEqual({
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            });
        });

        it("defines a required name field", () => {
            expect(attributes.name).toEqual({
                type: DataTypes.STRING,
                allowNull: false
            });
        });

        it("defines a required unique email field", () => {
            expect(attributes.email.type).toBe(DataTypes.STRING);

            expect(attributes.email.allowNull).toBe(false);
            expect(attributes.email.unique).toBe(true);

            expect(attributes.email.validate).toEqual({
                isEmail: true
            });

            expect(typeof attributes.email.set).toBe("function");
        });

        it("defines a required password field", () => {
            expect(attributes.password).toEqual({
                type: DataTypes.STRING,
                allowNull: false
            });
        });

        it("defines an optional avatar field", () => {
            expect(attributes.avatar).toEqual({
                type: DataTypes.STRING,
                allowNull: true
            });
        });

        it("defines an optional soft-deletion date", () => {
            expect(attributes.deletedAt).toEqual({
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            });
        });

        it("defines only the expected user attributes", () => {
            expect(Object.keys(attributes)).toEqual([
                "id",
                "name",
                "email",
                "password",
                "avatar",
                "deletedAt"
            ]);
        });
    });

    /* =============================
       EMAIL NORMALIZATION
    ============================= */

    describe("Email normalization", () => {
        it("normalizes email before storing it", () => {
            const userInstance = {
                setDataValue: jest.fn()
            };

            normalizeEmail.mockReturnValue("user@example.com");

            attributes.email.set.call(userInstance, "  USER@EXAMPLE.COM  ");

            expect(normalizeEmail).toHaveBeenCalledTimes(1);
            expect(normalizeEmail).toHaveBeenCalledWith("  USER@EXAMPLE.COM  ");

            expect(userInstance.setDataValue).toHaveBeenCalledWith("email", "user@example.com");
        });

        it("stores the value returned by normalizeEmail", () => {
            const userInstance = {
                setDataValue: jest.fn()
            };

            normalizeEmail.mockReturnValue("");

            attributes.email.set.call(userInstance, undefined);

            expect(userInstance.setDataValue).toHaveBeenCalledWith("email", "");
        });
    });

    /* =============================
       MODEL SCOPES
    ============================= */

    describe("Model scopes", () => {
        it("excludes password from the default scope", () => {
            expect(options.defaultScope).toEqual({
                attributes: {
                    exclude: [
                        "password"
                    ]
                }
            });
        });

        it("provides a scope that includes password", () => {
            expect(options.scopes).toEqual({
                withPassword: {
                    attributes: {
                        include: [
                            "password"
                        ]
                    }
                }
            });
        });
    });

    /* =============================
       MODEL OPTIONS
    ============================= */

    describe("Model options", () => {
        it("uses the users table with timestamps", () => {
            expect(options.tableName).toBe("users");
            expect(options.timestamps).toBe(true);
        });
    });
});
