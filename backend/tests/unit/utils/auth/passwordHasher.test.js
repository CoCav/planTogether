const bcrypt = require("bcrypt");

const {
    hashPassword,
    comparePassword
} = require("../../../../src/utils/auth/passwordHasher");

/* ==========================================================================
   Password Hasher Utility Unit Tests

   Tests password hashing utilities.

   Responsibilities
   - Test password hashing
   - Test password comparison
   - Test configured bcrypt salt rounds
   - Test bcrypt result passthrough

   Notes
   - BCRYPT_SALT_ROUNDS can override the default value.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("bcrypt");

describe("password hasher utility", () => {
    const originalSaltRounds = process.env.BCRYPT_SALT_ROUNDS;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env.BCRYPT_SALT_ROUNDS = originalSaltRounds;
        jest.resetModules();
    });

    /* =============================
       PASSWORD HASHING
    ============================= */

    describe("hashPassword", () => {
        it("hashes a password with the default salt rounds", async () => {
            bcrypt.hash.mockResolvedValue("hashed-password");

            const result = await hashPassword("Password123");

            expect(bcrypt.hash).toHaveBeenCalledWith(
                "Password123",
                10
            );

            expect(result).toBe("hashed-password");
        });

        it("uses configured bcrypt salt rounds", async () => {
            process.env.BCRYPT_SALT_ROUNDS = "4";

            jest.resetModules();

            const bcryptMock = require("bcrypt");
            const {
                hashPassword: loadHashPassword
            } = require("../../../../src/utils/auth/passwordHasher");

            bcryptMock.hash.mockResolvedValue("hashed-password");

            const result = await loadHashPassword("Password123");

            expect(bcryptMock.hash).toHaveBeenCalledWith(
                "Password123",
                4
            );

            expect(result).toBe("hashed-password");
        });
    });

    /* =============================
       PASSWORD COMPARISON
    ============================= */

    describe("comparePassword", () => {
        it("compares a plain password with a hashed password", async () => {
            bcrypt.compare.mockResolvedValue(true);

            const result = await comparePassword(
                "Password123",
                "hashed-password"
            );

            expect(bcrypt.compare).toHaveBeenCalledWith(
                "Password123",
                "hashed-password"
            );

            expect(result).toBe(true);
        });

        it("returns false when passwords do not match", async () => {
            bcrypt.compare.mockResolvedValue(false);

            const result = await comparePassword(
                "WrongPassword",
                "hashed-password"
            );

            expect(result).toBe(false);
        });
    });
});
