import { describe, expect, it } from "vitest";
import useEventPermissions from "../../../hooks/events/useEventPermissions";

/* ==================================================
   USE EVENT PERMISSIONS TESTS
   Tests event role and permission logic
================================================== */

describe("useEventPermissions", () => {
    const user = { userId: 1 };

    const baseEvent = {
        status: "upcoming",
        participantCount: 1,
        maxParticipants: 5,
        registrationDeadline: null
    };

    it("resolves organizer role from organizers list", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "organizer" }],
            members: []
        });

        expect(result.myRole).toBe("organizer");
        expect(result.isMember).toBe(true);
    });

    it("resolves participant role from members list", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [],
            members: [{ id: 1, role: "participant" }]
        });

        expect(result.myRole).toBe("participant");
        expect(result.isMember).toBe(true);
    });

    it("allows a guest user to do nothing", () => {
        const result = useEventPermissions({
            user: null,
            event: baseEvent
        });

        expect(result.canJoin).toBe(false);
        expect(result.canLeave).toBe(false);
        expect(result.canEdit).toBe(false);
        expect(result.canDelete).toBe(false);
        expect(result.joinDisabledReason).toBeNull();
    });

    it("allows authenticated non-member to join available event", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            members: [],
            organizers: []
        });

        expect(result.canJoin).toBe(true);
        expect(result.joinDisabledReason).toBeNull();
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
        expect(result.joinDisabledReason).toBe("Registration closed");
    });

    it("prevents actions on past events", () => {
        const result = useEventPermissions({
            user,
            event: {
                ...baseEvent,
                status: "past"
            },
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.isPast).toBe(true);
        expect(result.canJoin).toBe(false);
        expect(result.canLeave).toBe(false);
        expect(result.canEdit).toBe(false);
        expect(result.canDelete).toBe(false);
        expect(result.joinDisabledReason).toBe("Event ended");
    });

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

    it("allows organizer to promote participants and demote co-organizers", () => {
        const result = useEventPermissions({
            user,
            event: baseEvent,
            organizers: [{ id: 1, role: "organizer" }]
        });

        expect(result.canPromote({ id: 2, role: "participant" })).toBe(true);
        expect(result.canDemote({ id: 2, role: "co_organizer" })).toBe(true);
    });

    it("prevents organizer from promoting or demoting themselves", () => {
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
