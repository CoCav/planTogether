import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useEventStatus from "../../../../../features/events/hooks/eventDetails/useEventStatus";

import { EVENT_STATUS } from "../../../../../features/shared/constants/eventStatus";

import { createEvent } from "../../../../factories/events/eventFactory";
import { createAuthenticatedUser } from "../../../../factories/users/userFactory";

/* ==================================================
   USE EVENT STATUS TESTS
   Tests event availability and join status helpers

   Handles:
   - past event detection
   - started event detection
   - participant limit checks
   - registration deadline checks
   - guest join status handling
   - join disabled reasons

   Notes:
   - uses reusable event and user test factories
================================================== */

describe("useEventStatus", () => {
    const user = createAuthenticatedUser();

    const baseEvent = createEvent({
        status: EVENT_STATUS.UPCOMING,
        participantCount: 1,
        maxParticipants: 5,
        registrationDeadline: null
    });

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(
            new Date("2026-04-24T12:00:00.000Z")
        );
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    /* =============================
       EVENT AVAILABILITY
    ============================= */

    it("detects past events", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                status: EVENT_STATUS.PAST
            })
        });

        expect(result.isPast).toBe(true);

        expect(result.joinDisabledReason).toBe("Event ended");
    });

    it("detects started events", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                startDateTime: "2026-04-24T11:59:00.000Z"
            })
        });

        expect(result.isStarted).toBe(true);
    });

    it("detects event as started when start time is equal to now", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                startDateTime: "2026-04-24T12:00:00.000Z"
            })
        });

        expect(result.isStarted).toBe(true);
    });

    it("does not detect future events as started", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                startDateTime: "2026-04-24T12:01:00.000Z"
            })
        });

        expect(result.isStarted).toBe(false);
    });

    it("does not detect missing event start date as started", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                startDateTime: null
            })
        });

        expect(result.isStarted).toBe(false);
    });

    it("detects full events", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                participantCount: 5,
                maxParticipants: 5
            })
        });

        expect(result.isEventFull).toBe(true);
        expect(result.joinDisabledReason).toBe("Event full");
    });

    it("does not mark event as full when maxParticipants is null", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                participantCount: 999,
                maxParticipants: null
            })
        });

        expect(result.isEventFull).toBe(false);
    });

    it("does not mark event as full when maxParticipants is empty", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                participantCount: 999,
                maxParticipants: ""
            })
        });

        expect(result.isEventFull).toBe(false);
    });

    it("detects closed registration", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                registrationDeadline: "2026-04-23T12:00:00.000Z"
            })
        });

        expect(result.isRegistrationClosed).toBe(true);
        expect(result.joinDisabledReason).toBe("Registration closed");
    });

    it("does not disable join for members when registration is closed", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                registrationDeadline: "2026-04-23T12:00:00.000Z"
            }),
            isMember: true
        });

        expect(result.isRegistrationClosed).toBe(true);
        expect(result.joinDisabledReason).toBeNull();
    });

    /* =============================
       GUEST STATUS
    ============================= */

    it("does not return a join disabled reason for guests", () => {
        const result = useEventStatus({
            user: null,
            event: baseEvent
        });

        expect(result.joinDisabledReason).toBeNull();
    });

    it("still detects full events for guests", () => {
        const result = useEventStatus({
            user: null,
            event: createEvent({
                ...baseEvent,
                participantCount: 5,
                maxParticipants: 5
            })
        });

        expect(result.isEventFull).toBe(true);
        expect(result.joinDisabledReason).toBeNull();
    });

    it("still detects past events for guests without returning disabled reason", () => {
        const result = useEventStatus({
            user: null,
            event: createEvent({
                ...baseEvent,
                status: EVENT_STATUS.PAST
            })
        });

        expect(result.isPast).toBe(true);
        expect(result.joinDisabledReason).toBeNull();
    });
});
