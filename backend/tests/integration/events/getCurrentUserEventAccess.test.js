/* ==============================================
   EVENTS INTEGRATION - GET CURRENT USER EVENT ACCESS TESTS

   Tests:
   - organizer event access retrieval
   - co-organizer event access retrieval
   - participant event access retrieval
   - non-member event access retrieval
   - past event access restrictions
   - started event delete access restrictions
   - authentication requirement
   - nonexistent event handling
   - invalid event ID validation

   Ensures:
   - authenticated users can retrieve their role and action access for one event
   - edit/delete access follows event role rules
   - past events disable edit/delete access
   - started events disable delete access
   - unauthenticated requests are rejected
=============================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../src/constants/eventStatus");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const {
    createOrganizerAndEvent,
    getAuthenticatedEventAccess
} = require("../../helpers/http/eventTestHelper");
const { joinEventAsAuthenticatedUser } = require("../../helpers/http/eventMembershipTestHelper");

const EventUserRole = require("../../../src/models/associations/eventUserRoleModel");

describe("Get Current User Event Access API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       ORGANIZER ACCESS
    ============================= */

    it("should return organizer access for event organizer", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Access Organizer",
                email: `accessorganizer${Date.now()}@test.com`
            },
            event: {
                title: "Organizer Access Event"
            }
        });

        const res = await getAuthenticatedEventAccess(event.id, organizerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            message: "Current user event access retrieved successfully",
            role: EVENT_ROLES.ORGANIZER,
            status: EVENT_STATUS.UPCOMING,
            canEdit: true,
            canDelete: true
        });
    });

    it("should disable delete access for organizer when event has already started", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Started Access Organizer",
                email: `startedaccess${Date.now()}@test.com`
            },
            event: {
                title: "Started Access Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2999-01-01T12:00:00.000Z"
            }
        });

        const res = await getAuthenticatedEventAccess(event.id, organizerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            role: EVENT_ROLES.ORGANIZER,
            status: EVENT_STATUS.ONGOING,
            canEdit: true,
            canDelete: false
        });
    });

    /* =============================
       CO-ORGANIZER ACCESS
    ============================= */

    it("should return co-organizer access for event co-organizer", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Co Organizer Owner",
                email: `coowner${Date.now()}@test.com`
            },
            event: {
                title: "Co Organizer Access Event"
            }
        });

        const coOrganizerAuth = await registerAndAuthenticateUser({
            name: "Co Organizer",
            email: `coorganizer${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

        await EventUserRole.update(
            {
                role: EVENT_ROLES.CO_ORGANIZER
            },
            {
                where: {
                    eventId: event.id,
                    userId: coOrganizerAuth.user.userId
                }
            }
        );

        const res = await getAuthenticatedEventAccess(event.id, coOrganizerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            role: EVENT_ROLES.CO_ORGANIZER,
            status: EVENT_STATUS.UPCOMING,
            canEdit: true,
            canDelete: false
        });
    });

    /* =============================
       PARTICIPANT ACCESS
    ============================= */

    it("should return participant access without edit or delete permissions", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Participant Access Owner",
                email: `participantowner${Date.now()}@test.com`
            },
            event: {
                title: "Participant Access Event"
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant Access User",
            email: `participantaccess${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await getAuthenticatedEventAccess(event.id, participantAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            role: EVENT_ROLES.PARTICIPANT,
            status: EVENT_STATUS.UPCOMING,
            canEdit: false,
            canDelete: false
        });
    });

    /* =============================
       NON-MEMBER ACCESS
    ============================= */

    it("should return null role for authenticated non-member", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Non Member Access Owner",
                email: `nonmemberowner${Date.now()}@test.com`
            },
            event: {
                title: "Non Member Access Event"
            }
        });

        const userAuth = await registerAndAuthenticateUser({
            name: "Non Member User",
            email: `nonmember${Date.now()}@test.com`
        });

        const res = await getAuthenticatedEventAccess(event.id, userAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            role: null,
            status: EVENT_STATUS.UPCOMING,
            canEdit: false,
            canDelete: false
        });
    });

    /* =============================
       PAST EVENT ACCESS
    ============================= */

    it("should disable edit and delete access for past events", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Past Access Organizer",
                email: `pastaccess${Date.now()}@test.com`
            },
            event: {
                title: "Past Access Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const res = await getAuthenticatedEventAccess(event.id, organizerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            role: EVENT_ROLES.ORGANIZER,
            status: EVENT_STATUS.PAST,
            canEdit: false,
            canDelete: false
        });
    });

    /* =============================
       AUTHENTICATION
    ============================= */

    it("should reject unauthenticated requests", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Auth Required Owner",
                email: `authrequired${Date.now()}@test.com`
            },
            event: {
                title: "Auth Required Event"
            }
        });

        const res = await getAuthenticatedEventAccess(event.id);

        expect(res.statusCode).toBe(401);
    });

    it("should reject invalid token", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Invalid Token Owner",
                email: `invalidtoken${Date.now()}@test.com`
            },
            event: {
                title: "Invalid Token Event"
            }
        });

        const res = await getAuthenticatedEventAccess(
            event.id,
            {
                Authorization: "Bearer fake-token"
            }
        );

        expect(res.statusCode).toBe(401);

        expect(res.body).toHaveProperty("message", "Invalid or expired token");
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 for nonexistent event", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Missing Event User",
            email: `missingevent${Date.now()}@test.com`
        });

        const res = await getAuthenticatedEventAccess(999999, userAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Invalid Event User",
            email: `invalidevent${Date.now()}@test.com`
        });

        const res = await getAuthenticatedEventAccess("abc", userAuth.headers);

        expect(res.statusCode).toBe(400);
    });
});
