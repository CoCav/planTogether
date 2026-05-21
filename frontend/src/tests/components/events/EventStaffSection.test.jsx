import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventStaffSection from "../../../components/events/EventStaffSection";

import { createCoOrganizerMember } from "../../factories/eventMemberships/membershipPermissionsFactory";

import { createAuthenticatedUser } from "../../factories/users/userFactory";

/* ==================================================
   EVENT STAFF SECTION TESTS
   Tests event staff section configuration

   Handles:
   - staff section copy
   - accessible staff section copy
   - staff empty message
   - demote action callback
   - remove action callback
   - authenticated action visibility

   Notes:
   - mocks EventMembersSection to focus on section configuration
   - uses reusable render helper
================================================== */

vi.mock("../../../components/events/EventMembersSection", () => ({
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
        canDemote: vi.fn(() => false),
        canRemove: vi.fn(() => false),
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
       ACTION CALLBACKS
    ============================= */

    it("should call onDemote when demote action is allowed", () => {
        const onDemote = vi.fn();

        renderEventStaffSection({
            canDemote: () => true,
            onDemote
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Demote"
        }));

        expect(onDemote).toHaveBeenCalledWith(2);
    });

    it("should hide demote action when demote is not allowed", () => {
        renderEventStaffSection({
            canDemote: () => false,
            canRemove: () => true
        });

        expect(screen.queryByRole("button", { name: "Demote" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    });

    it("should call onRemove when remove action is allowed", () => {
        const onRemove = vi.fn();

        renderEventStaffSection({
            canRemove: () => true,
            onRemove
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Remove"
        }));

        expect(onRemove).toHaveBeenCalledWith(2);
    });

    it("should hide actions for guest users", () => {
        renderEventStaffSection({
            user: null,
            canDemote: () => true,
            canRemove: () => true
        });

        expect(screen.queryByRole("button", {
            name: "Demote"
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: "Remove"
        })).not.toBeInTheDocument();
    });
});
