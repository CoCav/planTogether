const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/* ==================================================
   USER MODEL

   Handles:
   - user account data
   - email normalization before persistence
   - email must remain unique for authentication
   - avatar path storage
   - password field protection

   Notes:
   - password is excluded by default
   - withPassword scope is used only for authentication
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
