/* ==================================================
   FILE TEST FACTORY

   Handles:
   - valid image file generation
   - invalid file generation
   - oversized file generation

   Notes:
   - shared across upload validation and component tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   IMAGE FILES
============================= */

// Generate a valid image file
export const createImageFile = ({
    content = ["image"],
    name = "image.png",
    type = "image/png"
} = {}) => (
    new File(
        content,
        name,
        { type }
    )
);

// Generate a valid avatar image file
export const createAvatarFile = (overrides = {}) => (
    createImageFile({
        name: "avatar.png",
        type: "image/png",
        ...overrides
    })
);

// Generate a valid event image file
export const createEventImageFile = (overrides = {}) => (
    createImageFile({
        name: "event.png",
        type: "image/png",
        ...overrides
    })
);

/* =============================
   INVALID FILES
============================= */

// Generate an invalid non-image file
export const createInvalidFile = ({
    content = ["file"],
    name = "file.txt",
    type = "text/plain"
} = {}) => (
    new File(
        content,
        name,
        { type }
    )
);

/* =============================
   OVERSIZED FILES
============================= */

// Generate an oversized image file
export const createLargeImageFile = ({
    size,
    name = "large.png",
    type = "image/png"
} = {}) => (
    new File(
        [new Uint8Array(size)],
        name,
        { type }
    )
);
