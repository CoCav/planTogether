const fs = require("fs");
const path = require("path");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../../helpers/http/authTestHelper");
const {
    updateCurrentUserProfile,
    updateCurrentUserAvatar
} = require("../../../helpers/http/userTestHelper");

/* ==========================================================================
   Users Integration Tests - Update Current User Profile

   Tests current user profile updates.

   Responsibilities
   - Test successful profile updates
   - Test avatar updates
   - Test authentication errors
   - Test validation errors
   - Test profile update business rules

   Notes
   - Authenticated users can update their own profile.
   - Updated emails are normalized before persistence.
   - Previous avatar files are cleaned up after replacement.
=========================================================================== */

describe("Update Current User Profile API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       PROFILE UPDATE SUCCESS
    ============================= */

    describe("Profile update success", () => {
        it("updates the authenticated user's profile", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Old Name",
                email: `update${Date.now()}@test.com`
            });

            const response = await updateCurrentUserProfile(
                userAuth.headers,
                {
                    name: "New Name"
                }
            );

            expect(response.statusCode).toBe(200);

            expect(response.body.user).toMatchObject({
                name: "New Name",
                email: userAuth.email
            });
        });

        it("updates only the authenticated user's email", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Email Update User",
                email: `emailupdate${Date.now()}@test.com`
            });

            const response = await updateCurrentUserProfile(
                userAuth.headers,
                {
                    email: `updated${Date.now()}@test.com`
                }
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User profile updated successfully");

            expect(response.body.user.email).toContain("updated");
            expect(response.body.user.name).toBe("Email Update User");
        });

        it("normalizes updated email", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Normalize User",
                email: `normalize${Date.now()}@test.com`
            });

            const response = await updateCurrentUserProfile(
                userAuth.headers,
                {
                    email: "   NORMALIZED@TEST.COM   "
                }
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User profile updated successfully");

            expect(response.body.user.email).toBe("normalized@test.com");
        });
    });

    /* =============================
       AVATAR UPDATES
    ============================= */

    describe("Avatar updates", () => {
        it("updates the authenticated user's avatar", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Avatar User",
                email: `avatar${Date.now()}@test.com`
            });

            const response = await updateCurrentUserAvatar(
                userAuth.headers,
                {
                    buffer: Buffer.from("fake image"),
                    filename: "avatar.png",
                    contentType: "image/png"
                }
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User profile updated successfully");

            expect(response.body.user.avatar).toMatch(/^\/uploads\/avatars\/avatar-/);
        });

        it("deletes previous avatar when uploading a new one", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Cleanup User",
                email: `cleanup${Date.now()}@test.com`
            });

            const firstUploadResponse = await updateCurrentUserAvatar(
                userAuth.headers,
                {
                    buffer: Buffer.from("first image"),
                    filename: "first.png",
                    contentType: "image/png"
                }
            );

            const firstAvatarPath = firstUploadResponse.body.user.avatar;

            const secondUploadResponse = await updateCurrentUserAvatar(
                userAuth.headers,
                {
                    buffer: Buffer.from("second image"),
                    filename: "second.png",
                    contentType: "image/png"
                }
            );

            const secondAvatarPath = secondUploadResponse.body.user.avatar;

            expect(secondAvatarPath).not.toBe(firstAvatarPath);

            const oldAvatarAbsolutePath = path.join(
                __dirname,
                "../../../../..",
                firstAvatarPath
            );

            expect(fs.existsSync(oldAvatarAbsolutePath)).toBe(false);

            expect(secondUploadResponse.statusCode).toBe(200);
            expect(secondUploadResponse.body).toHaveProperty("message", "User profile updated successfully");
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects profile updates without authentication", async () => {
            const response = await updateCurrentUserProfile(
                {},
                {
                    name: "Unauthorized"
                }
            );

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid email update", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Invalid Email User",
                email: `invalidemail${Date.now()}@test.com`
            });

            const response = await updateCurrentUserProfile(
                userAuth.headers,
                {
                    email: "not-an-email"
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects too short name update", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Short Name User",
                email: `shortname${Date.now()}@test.com`
            });

            const response = await updateCurrentUserProfile(
                userAuth.headers,
                {
                    name: "A"
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid avatar file type", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Invalid Avatar User",
                email: `invalidavatar${Date.now()}@test.com`
            });

            const response = await updateCurrentUserAvatar(
                userAuth.headers,
                {
                    buffer: Buffer.from("fake pdf"),
                    filename: "document.pdf",
                    contentType: "application/pdf"
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects oversized avatar upload", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Oversized Avatar User",
                email: `oversized${Date.now()}@test.com`
            });

            const oversizedBuffer = Buffer.alloc(3 * 1024 * 1024);

            const response = await updateCurrentUserAvatar(
                userAuth.headers,
                {
                    buffer: oversizedBuffer,
                    filename: "oversized.png",
                    contentType: "image/png"
                }
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects duplicate email update", async () => {
            const firstUserAuth = await registerAndAuthenticateUser({
                name: "First User",
                email: `first${Date.now()}@test.com`
            });

            const secondUserAuth = await registerAndAuthenticateUser({
                name: "Second User",
                email: `second${Date.now()}@test.com`
            });

            const response = await updateCurrentUserProfile(
                firstUserAuth.headers,
                {
                    email: secondUserAuth.email
                }
            );

            expect(response.statusCode).toBe(409);
        });
    });
});
