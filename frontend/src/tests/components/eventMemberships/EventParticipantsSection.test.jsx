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
   - active and past empty messages
   - participant role badge omission
   - authenticated action visibility
   - ownership transfer action configuration
   - promote action configuration
   - remove action configuration
   - guest action hiding
   - decorative section icon configuration

   Notes:
   - mocks EventMembersSection to focus on section configuration
   - mocks MemberActionsMenu to inspect configured actions
   - uses reusable render helper
================================================== */

vi.mock("../../../components/eventMemberships/EventMembersSection", () => ({
    default: ({
        title,
        subtitle,
        members,
        emptyMessage,
        showRoleBadge,
        showActions,
        renderActions
    }) => (
        <section data-testid="event-members-section">
            <h2>{title}</h2>
            <p>{subtitle}</p>
            <span data-testid="show-role-badge">{String(showRoleBadge)}</span>

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

vi.mock("../../../components/eventMemberships/MemberActionsMenu", () => ({
    default: ({ actions = [] }) => (
        <div>
            {actions
                .filter((action) => action.show)
                .map((action) => (
                    <button
                        key={action.label}
                        type="button"
                        data-danger={String(Boolean(action.danger))}
                        data-separated={String(Boolean(action.separated))}
                        onClick={action.onClick}
                    >
                        {action.label}
                    </button>
                ))}
        </div>
    )
}));

describe("EventParticipantsSection", () => {
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
            name: "Event Participants"
        })).toBeInTheDocument();

        expect(screen.getByText("1 participant is attending this event.")).toBeInTheDocument();
    });

    it("should hide participant role badges", () => {
        renderEventParticipantsSection();

        expect(screen.getByTestId("show-role-badge")).toHaveTextContent("false");
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
       ACTION CONFIGURATION
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
            name: "Promote to team"
        })).toBeInTheDocument();
    });

    it("should call onPromote when promote action is allowed", () => {
        const onPromote = vi.fn();

        renderEventParticipantsSection({
            canPromote: () => true,
            onPromote
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Promote to team"
        }));

        expect(onPromote).toHaveBeenCalledWith(2);
    });

    it("should hide promote action when promote is not allowed", () => {
        renderEventParticipantsSection({
            canPromote: () => false,
            canRemove: () => true
        });

        expect(screen.queryByRole("button", {
            name: "Promote to team"
        })).not.toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: "Remove from event"
        })).toBeInTheDocument();
    });

    it("should call onRemove when remove action is allowed", () => {
        const onRemove = vi.fn();

        renderEventParticipantsSection({
            canRemove: () => true,
            onRemove
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Remove from event"
        }));

        expect(onRemove).toHaveBeenCalledWith(2);
    });

    it("should configure remove action as danger and separated", () => {
        renderEventParticipantsSection({
            canRemove: () => true
        });

        const removeButton = screen.getByRole("button", {
            name: "Remove from event"
        });

        expect(removeButton).toHaveAttribute("data-danger", "true");
        expect(removeButton).toHaveAttribute("data-separated", "true");
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
            name: "Promote to team"
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: "Remove from event"
        })).not.toBeInTheDocument();
    });
});
