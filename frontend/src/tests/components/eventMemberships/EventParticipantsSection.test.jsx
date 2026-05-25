import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventParticipantsSection from "../../../components/eventMemberships/EventParticipantsSection";

import { createParticipantMember } from "../../factories/eventMemberships/membershipPermissionsFactory";

import { createAuthenticatedUser } from "../../factories/users/userFactory";

/* ==================================================
   EVENT PARTICIPANTS SECTION TESTS
   Tests event participants section configuration

   Handles:
   - participant section copy
   - accessible participant section copy
   - active and past empty messages
   - guest header messages
   - accessible guest messaging
   - ownership transfer action callback
   - ownership transfer action visibility
   - promote action callback
   - remove action callback
   - authenticated action visibility

   Notes:
   - mocks EventMembersSection to focus on section configuration
   - uses reusable render helper
================================================== */

vi.mock("../../../components/eventMemberships/EventMembersSection", () => ({
    default: ({
        title,
        subtitle,
        members,
        emptyMessage,
        showActions,
        headerMessage,
        renderActions
    }) => (
        <section data-testid="event-members-section">
            <h2>{title}</h2>
            <p>{subtitle}</p>

            {headerMessage && <p>{headerMessage}</p>}

            {members.length === 0 ? (
                <p>{emptyMessage}</p>
            ) : (
                members.map((person) => (
                    <div key={person.id}>
                        <span>{person.name}</span>

                        {showActions && renderActions && (
                            <div>{renderActions(person)}</div>
                        )}
                    </div>
                ))
            )}
        </section>
    )
}));

describe("EventParticipantsSection", () => {

    /* =============================
       TEST DATA
    ============================= */

    const participants = [
        createParticipantMember({
            id: 2,
            name: "Alice"
        })
    ];

    const baseProps = {
        user: createAuthenticatedUser(),
        isPast: false,

        participants,
        participantCount: 1,

        canTransferOwnership: vi.fn(() => false),
        canPromote: vi.fn(() => false),
        canRemove: vi.fn(() => false),

        onPromote: vi.fn(),
        onRemove: vi.fn(),
        onTransferOwnership: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventParticipantsSection = (props = {}) => {
        return render(
            <EventParticipantsSection
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       SECTION COPY
    ============================= */

    it("should render participants title and subtitle", () => {
        renderEventParticipantsSection();

        expect(screen.getByRole("heading", {
            name: "1 Attendee"
        })).toBeInTheDocument();

        expect(screen.getByText("1 attendee is attending this event.")).toBeInTheDocument();
    });

    /* =============================
       EMPTY STATES
    ============================= */

    it("should render active empty message when there are no participants", () => {
        renderEventParticipantsSection({
            participants: [],
            participantCount: 0
        });

        expect(screen.getByText("No participants yet.")).toBeInTheDocument();
    });

    it("should render past empty message when there are no participants", () => {
        renderEventParticipantsSection({
            isPast: true,
            participants: [],
            participantCount: 0
        });

        expect(screen.getByText("No one attended this event.")).toBeInTheDocument();
    });

    /* =============================
       GUEST MESSAGES
    ============================= */

    it("should render guest message for active events", () => {
        renderEventParticipantsSection({
            user: null
        });

        expect(
            screen.getByText("🔐 Login to join this event and interact with participants.")
        ).toBeInTheDocument();
    });

    it("should render ended message for guest on past events", () => {
        renderEventParticipantsSection({
            user: null,
            isPast: true
        });

        expect(screen.getByText("This event has ended.")).toBeInTheDocument();
    });

    /* =============================
       ACTION CALLBACKS
    ============================= */

    it("should call onTransferOwnership when ownership transfer action is allowed", () => {
        const onTransferOwnership = vi.fn();

        renderEventParticipantsSection({
            canTransferOwnership: () => true,
            onTransferOwnership
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Transfer ownership"
        }));

        expect(onTransferOwnership).toHaveBeenCalledWith(2);
    });

    it("should hide ownership transfer action when ownership transfer is not allowed", () => {
        renderEventParticipantsSection({
            canTransferOwnership: () => false,
            canPromote: () => true
        });

        expect(screen.queryByRole("button", {
            name: "Transfer ownership"
        })).not.toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: "Promote"
        })).toBeInTheDocument();
    });

    it("should call onPromote when promote action is allowed", () => {
        const onPromote = vi.fn();

        renderEventParticipantsSection({
            canPromote: () => true,
            onPromote
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Promote"
        }));

        expect(onPromote).toHaveBeenCalledWith(2);
    });

    it("should hide promote action when promote is not allowed", () => {
        renderEventParticipantsSection({
            canPromote: () => false,
            canRemove: () => true
        });

        expect(screen.queryByRole("button", { name: "Promote" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    });

    it("should call onRemove when remove action is allowed", () => {
        const onRemove = vi.fn();

        renderEventParticipantsSection({
            canRemove: () => true,
            onRemove
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Remove"
        }));

        expect(onRemove).toHaveBeenCalledWith(2);
    });


    it("should hide actions for guest users", () => {
        renderEventParticipantsSection({
            user: null,
            canTransferOwnership: () => true,
            canPromote: () => true,
            canRemove: () => true
        });

        expect(screen.queryByRole("button", {
            name: "Transfer ownership"
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: "Promote"
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: "Remove"
        })).not.toBeInTheDocument();

    });
});
