/* ==================================================
   USER INTEGRATION - UPDATE CURRENT USER PROFILE TESTS

   Tests:
   - authenticated profile update
   - avatar upload update
   - previous avatar cleanup
   - invalid email validation
   - invalid name validation
   - duplicate email rejection
   - invalid avatar file rejection
   - oversized avatar rejection
   - email-only profile update
   - email normalization on update
   - authentication protection

   Ensures:
   - authenticated users can update their profile
   - uploaded avatars are stored correctly
   - previous avatar files are cleaned up
   - validators protect profile updates
   - duplicate emails are rejected safely
================================================== */

const fs = require("fs");
const path = require("path");

const request = require("supertest");
const app = require("../../../../src/app");

const { initDB, resetDB, closeDB } = require("../../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../../helpers/api/authHelper");

describe("Update Current User Profile API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       PROFILE UPDATE SUCCESS
    ============================= */

    it("should update current user profile", async () => {
        const userAuth = await registerAndGetToken({
            name: "Old Name",
            email: `update${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .send({
                name: "New Name"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.user).toMatchObject({
            name: "New Name",
            email: userAuth.email
        });
    });

    it("should update only email", async () => {
        const userAuth = await registerAndGetToken({
            name: "Email Update User",
            email: `emailupdate${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .send({
                email: `updated${Date.now()}@test.com`
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User profile updated successfully");

        expect(res.body.user.email).toContain("updated");

        expect(res.body.user.name).toBe("Email Update User");
    });

    it("should normalize updated email", async () => {
        const userAuth = await registerAndGetToken({
            name: "Normalize User",
            email: `normalize${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .send({
                email: "   NORMALIZED@TEST.COM   "
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User profile updated successfully");

        expect(res.body.user.email).toBe("normalized@test.com");
    });

    /* =============================
       AVATAR UPLOADS
    ============================= */

    it("should update current user avatar", async () => {
        const userAuth = await registerAndGetToken({
            name: "Avatar User",
            email: `avatar${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .attach("avatar", Buffer.from("fake image"), {
                filename: "avatar.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User profile updated successfully");

        expect(res.body.user.avatar).toMatch(/^\/uploads\/avatars\/avatar-/);
    });

    it("should delete previous avatar when uploading a new one", async () => {
        const userAuth = await registerAndGetToken({
            name: "Cleanup User",
            email: `cleanup${Date.now()}@test.com`
        });

        const firstUploadRes = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .attach("avatar", Buffer.from("first image"), {
                filename: "first.png",
                contentType: "image/png"
            });

        const firstAvatarPath = firstUploadRes.body.user.avatar;

        const secondUploadRes = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .attach("avatar", Buffer.from("second image"), {
                filename: "second.png",
                contentType: "image/png"
            });

        const secondAvatarPath = secondUploadRes.body.user.avatar;

        expect(secondAvatarPath).not.toBe(firstAvatarPath);

        const oldAvatarAbsolutePath = path.join(__dirname, "../../../../..", firstAvatarPath);

        expect(fs.existsSync(oldAvatarAbsolutePath)).toBe(false);

        expect(secondUploadRes.statusCode).toBe(200);
        expect(secondUploadRes.body).toHaveProperty("message", "User profile updated successfully");
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject updating current profile without token", async () => {
        const res = await request(app)
            .put("/api/users/me")
            .send({
                name: "Unauthorized"
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid email update", async () => {
        const userAuth = await registerAndGetToken({
            name: "Invalid Email User",
            email: `invalidemail${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .send({
                email: "not-an-email"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject too short name update", async () => {
        const userAuth = await registerAndGetToken({
            name: "Short Name User",
            email: `shortname${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .send({
                name: "A"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid avatar file type", async () => {
        const userAuth = await registerAndGetToken({
            name: "Invalid Avatar User",
            email: `invalidavatar${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .attach("avatar", Buffer.from("fake pdf"), {
                filename: "document.pdf",
                contentType: "application/pdf"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject oversized avatar upload", async () => {
        const userAuth = await registerAndGetToken({
            name: "Oversized Avatar User",
            email: `oversized${Date.now()}@test.com`
        });

        const oversizedBuffer = Buffer.alloc(3 * 1024 * 1024);

        const res = await request(app)
            .put("/api/users/me")
            .set(userAuth.headers)
            .attach("avatar", oversizedBuffer, {
                filename: "oversized.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject duplicate email update", async () => {
        const firstUserAuth = await registerAndGetToken({
            name: "First User",
            email: `first${Date.now()}@test.com`
        });

        const secondUserAuth = await registerAndGetToken({
            name: "Second User",
            email: `second${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me")
            .set(firstUserAuth.headers)
            .send({
                email: secondUserAuth.email
            });

        expect(res.statusCode).toBe(409);
    });
});
