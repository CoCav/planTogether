/* ==================================================
   AUTH INTEGRATION - PROFILE

   Tests:
   - authenticated profile retrieval
   - missing token rejection
   - invalid token rejection
   - profile update
   - avatar upload update
   - old avatar file deletion
   - invalid update rejection
   - duplicate email rejection

   Ensures:
   - profile routes are protected
   - profile updates are persisted
   - avatar uploads are stored correctly
   - replaced avatar files are cleaned up
   - password is never exposed
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const fs = require("fs");
const path = require("path")


describe("Profile API", () => {
    beforeAll(async () => {
        await initDB();
    });

    afterEach(async () => {
        await EventUserRole.destroy({ where: {} });
        await Event.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe("GET /api/auth/profile", () => {
        it("should get the profile of an authenticated user", async () => {
            const email = `profile${Date.now()}@test.com`;

            const registerRes = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Profile User",
                    email,
                    password: "Password123"
                });

            const token = registerRes.body.token;

            const res = await request(app)
                .get("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);

            expect(res.body).toHaveProperty("message", "User profile retrieved successfully");
            expect(res.body).toHaveProperty("user");

            expect(res.body.user).toMatchObject({
                name: "Profile User",
                email,
                avatar: null
            });

            expect(res.body.user).not.toHaveProperty("password");
        });

        it("should reject access without token", async () => {
            const res = await request(app).get("/api/auth/profile");

            expect(res.statusCode).toBe(401);
        });

        it("should reject access with invalid token", async () => {
            const res = await request(app)
                .get("/api/auth/profile")
                .set("Authorization", "Bearer invalid-token");

            expect(res.statusCode).toBe(401);
        });
    });

    describe("PUT /api/auth/profile", () => {
        it("should update the profile of an authenticated user", async () => {
            const originalEmail = `profileupdate${Date.now()}@test.com`;
            const updatedEmail = `updatedprofile${Date.now()}@test.com`;

            const registerRes = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Profile User",
                    email: originalEmail,
                    password: "Password123"
                });

            const token = registerRes.body.token;

            const res = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Updated Name",
                    email: updatedEmail
                });

            expect(res.statusCode).toBe(200);

            expect(res.body).toHaveProperty("message", "User profile updated successfully");
            expect(res.body).toHaveProperty("user");

            expect(res.body.user).toMatchObject({
                name: "Updated Name",
                email: updatedEmail,
                avatar: null
            });

            expect(res.body.user).not.toHaveProperty("password");

            const profileRes = await request(app)
                .get("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`);

            expect(profileRes.body.user.name).toBe("Updated Name");
            expect(profileRes.body.user.email).toBe(updatedEmail);
            expect(profileRes.body.user.avatar).toBeNull();
        });

        it("should update the profile avatar of an authenticated user", async () => {
            const email = `avatarprofile${Date.now()}@test.com`;

            const registerRes = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Avatar Profile User",
                    email,
                    password: "Password123"
                });

            const token = registerRes.body.token;

            const res = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .field("name", "Avatar Updated")
                .field("email", email)
                .attach("avatar", Buffer.from("fake image content"), {
                    filename: "avatar.png",
                    contentType: "image/png"
                });

            expect(res.statusCode).toBe(200);

            expect(res.body.user).toMatchObject({
                name: "Avatar Updated",
                email
            });

            expect(res.body.user.avatar).toMatch(/^\/uploads\/avatars\/avatar-/);

            const profileRes = await request(app)
                .get("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`);

            expect(profileRes.body.user.avatar).toBe(res.body.user.avatar);
        });

        it("should delete old avatar file when avatar is replaced", async () => {
            const email = `replaceavatar${Date.now()}@test.com`;

            const registerRes = await request(app)
                .post("/api/auth/register")
                .field("name", "Avatar Replace User")
                .field("email", email)
                .field("password", "Password123")
                .attach("avatar", Buffer.from("old avatar content"), {
                    filename: "old-avatar.png",
                    contentType: "image/png"
                });

            const token = registerRes.body.token;
            const oldAvatar = registerRes.body.user.avatar;

            const oldAvatarPath = path.join(__dirname, "../../../", oldAvatar);

            expect(fs.existsSync(oldAvatarPath)).toBe(true);

            const res = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .field("name", "Avatar Replace User")
                .field("email", email)
                .attach("avatar", Buffer.from("new avatar content"), {
                    filename: "new-avatar.png",
                    contentType: "image/png"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.avatar).toMatch(/^\/uploads\/avatars\/avatar-/);
            expect(res.body.user.avatar).not.toBe(oldAvatar);

            expect(fs.existsSync(oldAvatarPath)).toBe(false);
        });

        it("should reject update without token", async () => {
            const res = await request(app)
                .put("/api/auth/profile")
                .send({
                    name: "Updated Name",
                    email: `updated${Date.now()}@test.com`
                });

            expect(res.statusCode).toBe(401);
        });

        it("should reject update with invalid token", async () => {
            const res = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", "Bearer invalid-token")
                .send({
                    name: "Updated Name",
                    email: `updated${Date.now()}@test.com`
                });

            expect(res.statusCode).toBe(401);
        });

        it("should reject invalid email", async () => {
            const registerRes = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Profile Validation User",
                    email: `profileval${Date.now()}@test.com`,
                    password: "Password123"
                });

            const token = registerRes.body.token;

            const res = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Updated Name",
                    email: "invalid-email"
                });

            expect(res.statusCode).toBe(400);
        });

        it("should reject empty fields", async () => {
            const registerRes = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Empty Field User",
                    email: `empty${Date.now()}@test.com`,
                    password: "Password123"
                });

            const token = registerRes.body.token;

            const res = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "",
                    email: ""
                });

            expect(res.statusCode).toBe(400);
        });

        it("should reject duplicate email", async () => {
            const firstEmail = `first${Date.now()}@test.com`;
            const secondEmail = `second${Date.now()}@test.com`;

            await request(app).post("/api/auth/register").send({
                name: "First User",
                email: firstEmail,
                password: "Password123"
            });

            const secondRegisterRes = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Second User",
                    email: secondEmail,
                    password: "Password123"
                });

            const token = secondRegisterRes.body.token;

            const res = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Updated Name",
                    email: firstEmail
                });

            expect(res.statusCode).toBe(409);
        });
    });
});
