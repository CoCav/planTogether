/* ==================================================
   FILE MOCK HELPERS

   Handles:
   - image file mocks
   - invalid file mocks
   - oversized file mocks

   Notes:
   - shared across upload and form tests
   - aligned with avatar and event image validation
================================================== */

/* =============================
   IMAGE FILES
============================= */

// Create a valid mock image file
export const createMockImageFile = ({
    name = "image.png",
    type = "image/png",
    content = "image-content"
} = {}) => {

    return new File(
        [content],
        name,
        { type }
    );
};

/* =============================
   INVALID FILES
============================= */

// Create an invalid mock file
export const createMockInvalidFile = ({
    name = "file.txt",
    type = "text/plain",
    content = "invalid-content"
} = {}) => {

    return new File(
        [content],
        name,
        { type }
    );
};

/* =============================
   OVERSIZED FILES
============================= */

// Create an oversized mock file
export const createMockOversizedFile = ({
    name = "large-image.png",
    type = "image/png",
    sizeInMb = 5
} = {}) => {

    const content = new Uint8Array(
        sizeInMb * 1024 * 1024
    );

    return new File(
        [content],
        name,
        { type }
    );
};
