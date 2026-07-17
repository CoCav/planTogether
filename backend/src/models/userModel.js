const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const { normalizeEmail } = require("../utils/stringNormalizer");

/* ==========================================================================
   User Model

   Defines the user database model.

   Responsibilities
   - Store user account information
   - Normalize email addresses
   - Store avatar paths
   - Protect password visibility
   - Support soft-deleted accounts

   Notes
   - Passwords are excluded from the default scope.
   - The withPassword scope is intended for authentication only.
=========================================================================== */

/* =============================
   USER MODEL
============================= */

// Define user account fields, scopes and normalization behavior
const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,

        // Normalize email before saving
        set(value) {
            this.setDataValue(
                "email",
                normalizeEmail(value)
            );
        },

        validate: {
            isEmail: true
        }
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },

    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: "users",
    timestamps: true,

    // Hide password from regular queries
    defaultScope: {
        attributes: {
            exclude: ["password"]
        }
    },

    // Explicit scope for authentication
    scopes: {
        withPassword: {
            attributes: {
                include: ["password"]
            }
        }
    }
});

module.exports = User;
