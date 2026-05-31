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
   - guest login prompt
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

    it("should detect past events", () => {
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

    it("should detect started events", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                startDateTime: "2026-04-24T11:59:00.000Z"
            })
        });

        expect(result.isStarted).toBe(true);
    });

    it("should detect event as started when start time is equal to now", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                startDateTime: "2026-04-24T12:00:00.000Z"
            })
        });

        expect(result.isStarted).toBe(true);
    });

    it("should not detect future events as started", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                startDateTime: "2026-04-24T12:01:00.000Z"
            })
        });

        expect(result.isStarted).toBe(false);
    });

    it("should not detect missing event start date as started", () => {
        const result = useEventStatus({
            user,
            event: createEvent({
                ...baseEvent,
                startDateTime: null
            })
        });

        expect(result.isStarted).toBe(false);
    });

    it("should detect full events", () => {
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

    it("should not mark event as full when maxParticipants is null", () => {
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

    it("should detect closed registration", () => {
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

    it("should not disable join for members when registration is closed", () => {
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
       UI VISIBILITY
    ============================= */

    it("should show login prompt for guest on available upcoming event", () => {
        const result = useEventStatus({
            user: null,
            event: baseEvent
        });

        expect(result.showLoginPrompt).toBe(true);
        expect(result.joinDisabledReason).toBeNull();
    });

    it("should not show login prompt when event is full", () => {
        const result = useEventStatus({
            user: null,
            event: createEvent({
                ...baseEvent,
                participantCount: 5,
                maxParticipants: 5
            })
        });

        expect(result.showLoginPrompt).toBe(false);
        expect(result.isEventFull).toBe(true);
    });

    it("should not show login prompt for past events", () => {
        const result = useEventStatus({
            user: null,
            event: createEvent({
                ...baseEvent,
                status: EVENT_STATUS.PAST
            })
        });

        expect(result.showLoginPrompt).toBe(false);
    });
});
