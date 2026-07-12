const {
    EVENT_SORT_FIELDS,
    EVENT_ADMIN_SORT_FIELDS
} = require("../../../src/constants/eventSortFields");

/* ==========================================================================
   Event Sort Field Constants Unit Tests

   Tests shared event sort field constants.

   Responsibilities
   - Test public event sort fields
   - Test administrative event sort fields
   - Test shared sort field reuse

   Notes
   - Administrative sort fields extend the public event sort fields.
=========================================================================== */

describe("eventSortFields constants", () => {

    /* =============================
       EVENT SORT FIELDS
    ============================= */

    describe("Event sort fields", () => {
        it("exposes supported event sort fields", () => {
            expect(EVENT_SORT_FIELDS).toEqual([
                "startDateTime",
                "title",
                "createdAt"
            ]);
        });
    });

    /* =============================
       ADMIN EVENT SORT FIELDS
    ============================= */

    describe("Event admin sort fields", () => {
        it("includes all public event sort fields and creatorId", () => {
            expect(EVENT_ADMIN_SORT_FIELDS).toEqual([
                ...EVENT_SORT_FIELDS,
                "creatorId"
            ]);
        });

        it("keeps public and administrative sort fields as separate arrays", () => {
            expect(EVENT_ADMIN_SORT_FIELDS).not.toBe(EVENT_SORT_FIELDS);
        });
    });
});
