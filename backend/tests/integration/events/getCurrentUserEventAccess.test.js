const { EVENT_ROLES } = require("../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../src/constants/eventStatus");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const {
    createOrganizerAndEvent,
    getAuthenticatedEventAccess
} = require("../../helpers/http/eventTestHelper");

const {
    joinEventAsAuthenticatedUser,
    updateEventMemberRole
} = require("../../helpers/http/eventMembershipTestHelper");

const { findCoOrganizerId } = require("../../helpers/http/userTestHelper");

/* ==========================================================================
   Events Integration Tests - Get Current User Event Access

   Tests current user event access behavior.

   Responsibilities
   - Test organizer access
   - Test co-organizer access
   - Test participant access
   - Test non-member access
   - Test authentication errors
   - Test validation errors
   - Test missing event handling

   Notes
   - Access depends on the current user's membership role.
   - Past events disable edit and delete access.
   - Started events disable delete access.
=========================================================================== */

describe("Get Current User Event Access API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       ORGANIZER ACCESS
    ============================= */

    describe("Organizer access", () => {
        it("returns organizer access for event organizer", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Organizer Access Event"
                }
            });

            const response = await getAuthenticatedEventAccess(event.id, organizerAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                message: "Current user event access retrieved successfully",
                role: EVENT_ROLES.ORGANIZER,
                status: EVENT_STATUS.UPCOMING,
                canEdit: true,
                canDelete: true
            });
        });

        it("disables delete access for organizer when event has already started", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Started Access Event",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2999-01-01T12:00:00.000Z"
                }
            });

            const response = await getAuthenticatedEventAccess(event.id, organizerAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                role: EVENT_ROLES.ORGANIZER,
                status: EVENT_STATUS.ONGOING,
                canEdit: true,
                canDelete: false
            });
        });
    });

    /* =============================
       CO-ORGANIZER ACCESS
    ============================= */

    describe("Co-organizer access", () => {
        it("returns co-organizer access for event co-organizer", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Co Organizer Access Event"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Access Co Organizer",
                email: `accesscoorganizer${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

            const coOrganizerId = await findCoOrganizerId(coOrganizerAuth);

            await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            const response = await getAuthenticatedEventAccess(event.id, coOrganizerAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                role: EVENT_ROLES.CO_ORGANIZER,
                status: EVENT_STATUS.UPCOMING,
                canEdit: true,
                canDelete: false
            });
        });
    });

    /* =============================
       PARTICIPANT ACCESS
    ============================= */

    describe("Participant access", () => {
        it("returns participant access without edit or delete permissions", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Participant Access Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Participant Access User",
                email: `participantaccess${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getAuthenticatedEventAccess(event.id, participantAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                role: EVENT_ROLES.PARTICIPANT,
                status: EVENT_STATUS.UPCOMING,
                canEdit: false,
                canDelete: false
            });
        });
    });

    /* =============================
       NON-MEMBER ACCESS
    ============================= */

    describe("Non-member access", () => {
        it("returns null role for authenticated non-member", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Non Member Access Event"
                }
            });

            const userAuth = await registerAndAuthenticateUser({
                name: "Non Member User",
                email: `nonmember${Date.now()}@test.com`
            });

            const response = await getAuthenticatedEventAccess(event.id, userAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                role: null,
                status: EVENT_STATUS.UPCOMING,
                canEdit: false,
                canDelete: false
            });
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("disables edit and delete access for past events", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Past Access Event",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const response = await getAuthenticatedEventAccess(event.id, organizerAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                role: EVENT_ROLES.ORGANIZER,
                status: EVENT_STATUS.PAST,
                canEdit: false,
                canDelete: false
            });
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects unauthenticated requests", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Auth Required Event"
                }
            });

            const response = await getAuthenticatedEventAccess(event.id);

            expect(response.statusCode).toBe(401);
        });

        it("rejects invalid token", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Invalid Token Event"
                }
            });

            const response = await getAuthenticatedEventAccess(event.id, {
                Authorization: "Bearer fake-token"
            });

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty("message", "Invalid or expired token");
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Invalid Event User",
                email: `invalidevent${Date.now()}@test.com`
            });

            const response = await getAuthenticatedEventAccess("abc", userAuth.headers);

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Missing Event User",
                email: `missingevent${Date.now()}@test.com`
            });

            const response = await getAuthenticatedEventAccess(999999, userAuth.headers);

            expect(response.statusCode).toBe(404);
        });
    });
});
