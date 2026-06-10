import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventStaffSection from "../../../components/eventMemberships/EventStaffSection";

import { createCoOrganizerMember } from "../../factories/eventMemberships/membershipPermissionsFactory";

import { createAuthenticatedUser } from "../../factories/users/userFactory";

/* ==================================================
   EVENT STAFF SECTION TESTS
   Tests event staff section configuration

   Handles:
   - staff section copy
   - staff empty message
   - authenticated action visibility
   - ownership transfer action configuration
   - demote action configuration
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
        showActions,
        renderActions
    }) => (
        <section data-testid="event-members-section">
            <h2>{title}</h2>
            <p>{subtitle}</p>

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

describe("EventStaffSection", () => {

    /* =============================
       TEST DATA
    ============================= */

    const staff = [
        createCoOrganizerMember({
            id: 2,
            name: "Alice"
        })
    ];

    const baseProps = {
        user: createAuthenticatedUser(),

        staff,
        staffCount: 1,

        canTransferOwnership: vi.fn(() => false),
        canDemote: vi.fn(() => false),
        canRemove: vi.fn(() => false),

        onTransferOwnership: vi.fn(),
        onDemote: vi.fn(),
        onRemove: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventStaffSection = (props = {}) => {
        return render(
            <EventStaffSection
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       SECTION COPY
    ============================= */

    it("should render staff title and subtitle", () => {
        renderEventStaffSection();

        expect(screen.getByRole("heading", {
            name: "Event Team"
        })).toBeInTheDocument();

        expect(screen.getByText("1 member is managing this event.")).toBeInTheDocument();
    });

    /* =============================
       EMPTY STATE
    ============================= */

    it("should render staff empty message when there are no staff members", () => {
        renderEventStaffSection({
            staff: [],
            staffCount: 0
        });

        expect(screen.getByText("No team members.")).toBeInTheDocument();
    });

    /* =============================
       ACTION CONFIGURATION
    ============================= */

    it("should call onTransferOwnership when ownership transfer action is allowed", () => {
        const onTransferOwnership = vi.fn();

        renderEventStaffSection({
            canTransferOwnership: () => true,
            onTransferOwnership
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Transfer ownership"
        }));

        expect(onTransferOwnership).toHaveBeenCalledWith(2);
    });

    it("should hide ownership transfer action when ownership transfer is not allowed", () => {
        renderEventStaffSection({
            canTransferOwnership: () => false,
            canDemote: () => true
        });

        expect(screen.queryByRole("button", {
            name: "Transfer ownership"
        })).not.toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: "Demote from team"
        })).toBeInTheDocument();
    });

    it("should call onDemote when demote action is allowed", () => {
        const onDemote = vi.fn();

        renderEventStaffSection({
            canDemote: () => true,
            onDemote
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Demote from team"
        }));

        expect(onDemote).toHaveBeenCalledWith(2);
    });

    it("should hide demote action when demote is not allowed", () => {
        renderEventStaffSection({
            canDemote: () => false,
            canRemove: () => true
        });

        expect(screen.queryByRole("button", {
            name: "Demote from team"
        })).not.toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: "Remove from event"
        })).toBeInTheDocument();
    });

    it("should call onRemove when remove action is allowed", () => {
        const onRemove = vi.fn();

        renderEventStaffSection({
            canRemove: () => true,
            onRemove
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Remove from event"
        }));

        expect(onRemove).toHaveBeenCalledWith(2);
    });

    it("should configure remove action as danger and separated", () => {
        renderEventStaffSection({
            canRemove: () => true
        });

        const removeButton = screen.getByRole("button", {
            name: "Remove from event"
        });

        expect(removeButton).toHaveAttribute("data-danger", "true");
        expect(removeButton).toHaveAttribute("data-separated", "true");
    });

    it("should hide actions for guest users", () => {
        renderEventStaffSection({
            user: null,
            canTransferOwnership: () => true,
            canDemote: () => true,
            canRemove: () => true
        });

        expect(screen.queryByRole("button", {
            name: "Transfer ownership"
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: "Demote from team"
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: "Remove from event"
        })).not.toBeInTheDocument();
    });
});
