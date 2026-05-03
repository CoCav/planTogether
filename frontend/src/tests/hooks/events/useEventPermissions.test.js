import { describe, expect, it } from "vitest";
import useEventPermissions from "../../../hooks/events/useEventPermissions";

/* ==================================================
   USE EVENT PERMISSIONS TESTS
   Tests event role, permissions, and UI visibility logic
================================================== */

describe("useEventPermissions", () => {
    const user = { userId: 1 };

    const baseEvent = {
        status: "upcoming",
        participantCount: 1,
        maxParticipants: 5,
        registrationDeadline: null
    };

    /* =========================
       Role resolution
    ========================= */

    it("resolves organizer role from organizers list", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.myRole).toBe("organizer");
        expect(result.isMember).toBe(true);
    });

    it("resolves participant role from members list", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            members: [{ id: 1, role: "participant" }]
        });

        expect(result.myRole).toBe("participant");
        expect(result.isMember).toBe(true);
    });

    /* =========================
       Guest user behavior
    ========================= */

    it("prevents guest user from interacting", () => {
        const result = useEventPermissions({
            user: null,
            event: baseEvent
        });

        expect(result.canJoin).toBe(false);
        expect(result.canLeave).toBe(false);
        expect(result.canEdit).toBe(false);
        expect(result.canDelete).toBe(false);

        expect(result.showLoginPrompt).toBe(true);
        expect(result.showEventFullButton).toBe(false);
    });

    /* =========================
       Join logic
    ========================= */

    it("allows authenticated non-member to join", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent
        });

        expect(result.canJoin).toBe(true);
        expect(result.showJoinButton).toBe(true);
        expect(result.showEventFullButton).toBe(false);
    });

    it("prevents joining a full event", () => {
        const result = useEventPermissions({
            user,
            event: {
                ...baseEvent,
                participantCount: 5,
                maxParticipants: 5
            }
        });

        expect(result.isEventFull).toBe(true);
        expect(result.canJoin).toBe(false);
        expect(result.showEventFullButton).toBe(true);
        expect(result.showJoinButton).toBe(false);
        expect(result.joinDisabledReason).toBe("Event full");
    });

    it("prevents joining when registration is closed", () => {
        const result = useEventPermissions({
            user,
            event: {
                ...baseEvent,
                registrationDeadline: "2000-01-01T00:00:00.000Z"
            }
        });

        expect(result.isRegistrationClosed).toBe(true);
        expect(result.canJoin).toBe(false);
        expect(result.showRegistrationClosedButton).toBe(true);
        expect(result.showJoinButton).toBe(false);
        expect(result.joinDisabledReason).toBe("Registration closed");
    });

    it("prevents all actions on past events", () => {
        const result = useEventPermissions({
            user,
            event: {
                ...baseEvent,
                status: "past"
            }
        });

        expect(result.isPast).toBe(true);
        expect(result.canJoin).toBe(false);
        expect(result.canLeave).toBe(false);
        expect(result.canEdit).toBe(false);
        expect(result.canDelete).toBe(false);

        expect(result.showEventFullButton).toBe(false);
        expect(result.showLoginPrompt).toBe(false);
        expect(result.joinDisabledReason).toBe("Event ended");
    });

    /* =========================
       Role permissions
    ========================= */

    it("allows participant to leave but not edit or delete", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            members: [{ id: 1, role: "participant" }]
        });

        expect(result.canLeave).toBe(true);
        expect(result.canEdit).toBe(false);
        expect(result.canDelete).toBe(false);
    });

    it("allows organizer to edit and delete but not leave", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.canLeave).toBe(false);
        expect(result.canEdit).toBe(true);
        expect(result.canDelete).toBe(true);
    });

    it("allows co-organizer to edit but not delete", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "co_organizer" }]
        });

        expect(result.canLeave).toBe(true);
        expect(result.canEdit).toBe(true);
        expect(result.canDelete).toBe(false);
    });

    /* =========================
       Event full behavior
    ========================= */

    it("shows event full button for unauthenticated users", () => {
        const result = useEventPermissions({
            user: null,
            event: {
                ...baseEvent,
                participantCount: 5,
                maxParticipants: 5
            }
        });

        expect(result.showEventFullButton).toBe(true);
        expect(result.showLoginPrompt).toBe(false);
    });

    it("shows event full without removing organizer actions", () => {
        const result = useEventPermissions({
            user,
            event: {
                ...baseEvent,
                participantCount: 5,
                maxParticipants: 5
            },
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.showEventFullButton).toBe(true);
        expect(result.canEdit).toBe(true);
        expect(result.canDelete).toBe(true);
    });

    it("shows event full without removing participant leave action", () => {
        const result = useEventPermissions({
            user,
            event: {
                ...baseEvent,
                participantCount: 5,
                maxParticipants: 5
            },
            members: [{ id: 1, role: "participant" }]
        });

        expect(result.showEventFullButton).toBe(true);
        expect(result.canLeave).toBe(true);
    });

    /* =========================
       Member management
    ========================= */

    it("allows organizer to promote and demote", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.canPromote({ id: 2, role: "participant" })).toBe(true);
        expect(result.canDemote({ id: 2, role: "co_organizer" })).toBe(true);
    });

    it("prevents self promotion/demotion", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.canPromote({ id: 1, role: "participant" })).toBe(false);
        expect(result.canDemote({ id: 1, role: "co_organizer" })).toBe(false);
    });

    it("allows organizer to remove participants and co-organizers", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.canRemove({ id: 2, role: "participant" })).toBe(true);
        expect(result.canRemove({ id: 3, role: "co_organizer" })).toBe(true);
    });

    it("allows co-organizer to remove participants only", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "co_organizer" }]
        });

        expect(result.canRemove({ id: 2, role: "participant" })).toBe(true);
        expect(result.canRemove({ id: 3, role: "co_organizer" })).toBe(false);
    });

    it("prevents removing yourself", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.canRemove({ id: 1, role: "participant" })).toBe(false);
    });
});
