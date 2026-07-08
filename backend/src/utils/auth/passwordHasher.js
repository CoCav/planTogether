const bcrypt = require("bcrypt");

/* ==========================================================================
   Password Hasher

   Provides password hashing helpers.

   Responsibilities
   - Hash plain text passwords
   - Compare plain text passwords with hashed passwords
   - Use configurable bcrypt salt rounds

   Notes
   - BCRYPT_SALT_ROUNDS can be configured in .env.
   - Tests can use lower salt rounds for faster execution.
=========================================================================== */

const DEFAULT_BCRYPT_SALT_ROUNDS = 10;

const bcryptSaltRounds = Number(
    process.env.BCRYPT_SALT_ROUNDS || DEFAULT_BCRYPT_SALT_ROUNDS
);

const hashPassword = (password) => {
    return bcrypt.hash(password, bcryptSaltRounds);
};

const comparePassword = (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

module.exports = {
    hashPassword,
    comparePassword
};
