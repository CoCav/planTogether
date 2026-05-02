const express = require("express");
const request = require("supertest");
const uploadEventImage = require("../../src/middlewares/uploadEventImage");

/**
 * Upload Event Image Middleware
 *
 * Tests event image upload middleware behavior.
 *
 * Ensures image files are accepted, invalid files are rejected,
 * and upload limits are enforced.
*/

const createApp = () => {
    const app = express();

    app.post("/upload", uploadEventImage.single("image"), (req, res) => {
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

describe("uploadEventImage middleware", () => {
    it("should upload a valid image file", async () => {
        const app = createApp();

        const res = await request(app)
            .post("/upload")
            .attach("image", Buffer.from("fake image content"), {
                filename: "event.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.file.filename).toMatch(/^event-/);
        expect(res.body.file.mimetype).toBe("image/png");
        expect(res.body.file.path).toContain("uploads");
        expect(res.body.file.path).toContain("events");
    });

    it("should reject non-image files", async () => {
        const app = createApp();

        const res = await request(app)
            .post("/upload")
            .attach("image", Buffer.from("not an image"), {
                filename: "file.txt",
                contentType: "text/plain"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Only image files are allowed");
    });

    it("should reject files larger than 3MB", async () => {
        const app = createApp();

        const largeBuffer = Buffer.alloc(3 * 1024 * 1024 + 1);

        const res = await request(app)
            .post("/upload")
            .attach("image", largeBuffer, {
                filename: "large.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/file too large/i);
    });
});
