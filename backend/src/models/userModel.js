const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/* ==================================================
   USER MODEL

   Handles:
   - user account data
   - email normalization before persistence
   - email uniqueness for authentication
   - avatar path storage
   - password field protection
   - account deletion support

   Notes:
   - password is excluded by default
   - withPassword scope is used only for authentication
   - deletedAt is used for deleted accounts
================================================== */

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
            this.setDataValue("email", value.toLowerCase().trim());
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
        attributes: { exclude: ["password"] }
    },

    // Explicit scope for login/password checks
    scopes: {
        withPassword: {
            attributes: { include: ["password"] }
        }
    }
});

module.exports = User;
