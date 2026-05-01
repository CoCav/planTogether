const express = require("express");
const request = require("supertest");
const uploadAvatar = require("../../src/middlewares/uploadAvatar");

/**
 * Upload Avatar Middleware
 *
 * Tests avatar upload middleware behavior.
 *
 * Ensures image files are accepted, invalid files are rejected,
 * and upload limits are enforced.
*/

const createApp = () => {
    const app = express();

    app.post("/upload", uploadAvatar.single("avatar"), (req, res) => {
        return res.status(200).json({
            file: {
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                path: req.file.path
            }
        });
    });

    app.use((error, req, res, next) => {
        return res.status(400).json({
            message: error.message
        });
    });

    return app;
};

describe("uploadAvatar middleware", () => {
    it("should upload a valid image file", async () => {
        const app = createApp();

        const res = await request(app)
            .post("/upload")
            .attach("avatar", Buffer.from("fake image content"), {
                filename: "avatar.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.file.filename).toMatch(/^avatar-/);
        expect(res.body.file.mimetype).toBe("image/png");
    });

    it("should reject non-image files", async () => {
        const app = createApp();

        const res = await request(app)
            .post("/upload")
            .attach("avatar", Buffer.from("not an image"), {
                filename: "file.txt",
                contentType: "text/plain"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Only image files are allowed");
    });

    it("should reject files larger than 2MB", async () => {
        const app = createApp();

        const largeBuffer = Buffer.alloc(2 * 1024 * 1024 + 1);

        const res = await request(app)
            .post("/upload")
            .attach("avatar", largeBuffer, {
                filename: "large.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/file too large/i);
    });
});
