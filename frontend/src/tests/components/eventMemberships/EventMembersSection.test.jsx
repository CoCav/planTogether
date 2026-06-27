import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventMembersSection from "../../../components/eventMemberships/EventMembersSection";

import { createOrganizerMember, createParticipantMember } from "../../factories/eventMemberships/membershipPermissionsFactory";

/* ==================================================
   EVENT MEMBERS SECTION TESTS
   Tests reusable event membership list rendering

   Handles:
   - section heading and subtitle
   - empty member state
   - member rows, avatars and role badges
   - public profile navigation from member names and avatars
   - avatar fallback/display through UserAvatar
   - optional member actions
   - collapsed member preview
   - expanded paginated member list
   - view all / collapse toggle
   - accessible section and list semantics
================================================== */

describe("EventMembersSection", () => {

    /* =============================
       TEST DATA
    ============================= */

    const members = [
        createOrganizerMember({
            id: 1,
            name: "Alice",
            avatar: "/uploads/avatars/alice.png"
        }),
        createParticipantMember({
            id: 2,
            name: "Bob",
            avatar: "/uploads/avatars/bob.png"
        })
    ];

    const manyMembers = [
        createOrganizerMember({ id: 1, name: "Alice" }),
        createParticipantMember({ id: 2, name: "Bob" }),
        createParticipantMember({ id: 3, name: "Charlie" }),
        createParticipantMember({ id: 4, name: "Diana" }),
        createParticipantMember({ id: 5, name: "Eve" })
    ];

    const renderActions = vi.fn((person) => (
        <button type="button">
            Remove {person.name}
        </button>
    ));

    const baseProps = {
        title: "Participants",
        subtitle: "People attending this event",
        members,
        emptyMessage: "No participants yet.",
        showActions: true,
        renderActions
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventMembersSection = (props = {}) => {
        return render(
            <MemoryRouter>
                <EventMembersSection
                    {...baseProps}
                    {...props}
                />
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       SECTION HEADER
    ============================= */

    it("should render title and subtitle", () => {
        renderEventMembersSection();

        expect(screen.getByRole("heading", {
            name: "Participants"
        })).toBeInTheDocument();

        expect(screen.getByText("People attending this event")).toBeInTheDocument();
    });

    it("should not render subtitle when it is not provided", () => {
        renderEventMembersSection({
            subtitle: null
        });

        expect(screen.queryByText("People attending this event")).not.toBeInTheDocument();
    });

    it("should associate section with its heading", () => {
        renderEventMembersSection();

        expect(screen.getByRole("region", {
            name: "Participants"
        })).toBeInTheDocument();
    });

    /* =============================
       EMPTY STATE
    ============================= */

    it("should render empty state when there are no members", () => {
        renderEventMembersSection({
            members: []
        });

        expect(screen.getByText("No participants yet.")).toBeInTheDocument();
    });

    it("should use default empty message when none is provided", () => {
        renderEventMembersSection({
            members: [],
            emptyMessage: undefined
        });

        expect(screen.getByText("No members found.")).toBeInTheDocument();
    });

    /* =============================
       MEMBER ROWS
    ============================= */

    it("should render member rows", () => {
        renderEventMembersSection();

        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();

        expect(screen.getByText("Organizer")).toBeInTheDocument();
        expect(screen.getByText("Participant")).toBeInTheDocument();
    });

    it("should render members as an accessible list", () => {
        renderEventMembersSection();

        expect(screen.getByRole("list")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("should link member names to their public profile pages", () => {
        renderEventMembersSection();

        expect(screen.getByRole("link", {
            name: "Alice"
        })).toHaveAttribute("href", "/users/1");

        expect(screen.getByRole("link", {
            name: "Bob"
        })).toHaveAttribute("href", "/users/2");
    });

    it("should link member avatars to their public profile pages", () => {
        renderEventMembersSection();

        expect(screen.getByRole("link", {
            name: "View Alice profile"
        })).toHaveAttribute("href", "/users/1");

        expect(screen.getByRole("link", {
            name: "View Bob profile"
        })).toHaveAttribute("href", "/users/2");
    });

    it("should render member avatars", () => {
        renderEventMembersSection();

        expect(screen.getByAltText("Alice avatar")).toBeInTheDocument();
        expect(screen.getByAltText("Bob avatar")).toBeInTheDocument();
    });

    it("should hide role badges when disabled", () => {
        renderEventMembersSection({
            showRoleBadge: false
        });

        expect(screen.queryByText("Organizer")).not.toBeInTheDocument();
        expect(screen.queryByText("Participant")).not.toBeInTheDocument();
    });

    /* =============================
       MEMBER ACTIONS
    ============================= */

    it("should render actions when actions are enabled", () => {
        renderEventMembersSection();

        expect(screen.getByText("Remove Alice")).toBeInTheDocument();
        expect(screen.getByText("Remove Bob")).toBeInTheDocument();
    });

    it("should call renderActions for each visible member when actions are enabled", () => {
        renderEventMembersSection();

        expect(renderActions).toHaveBeenCalledTimes(2);
        expect(renderActions).toHaveBeenCalledWith(members[0]);
        expect(renderActions).toHaveBeenCalledWith(members[1]);
    });

    it("should not render actions when actions are disabled", () => {
        renderEventMembersSection({
            showActions: false
        });

        expect(screen.queryByText(/remove alice/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/remove bob/i)).not.toBeInTheDocument();

        expect(renderActions).not.toHaveBeenCalled();
    });

    it("should not render actions when renderActions is not provided", () => {
        renderEventMembersSection({
            renderActions: null
        });

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    /* =============================
       PREVIEW AND PAGINATION
    ============================= */

    it("should render a collapsed member preview when member count exceeds preview limit", () => {
        renderEventMembersSection({
            members: manyMembers,
            previewLimit: 2,
            pageSize: 2
        });

        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();

        expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "View all" })).toBeInTheDocument();
    });

    it("should expose expanded state on the view all toggle", () => {
        renderEventMembersSection({
            members: manyMembers,
            previewLimit: 2,
            pageSize: 2
        });

        const toggle = screen.getByRole("button", { name: "View all" });

        expect(toggle).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(toggle);

        expect(screen.getByRole("button", { name: "Collapse" })).toHaveAttribute("aria-expanded", "true");
    });

    it("should expand member list when clicking view all", () => {
        renderEventMembersSection({
            members: manyMembers,
            previewLimit: 2,
            pageSize: 2
        });

        fireEvent.click(screen.getByRole("button", { name: "View all" }));

        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();

        expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument();
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should paginate expanded member list", () => {
        renderEventMembersSection({
            members: manyMembers,
            previewLimit: 2,
            pageSize: 2
        });

        fireEvent.click(screen.getByRole("button", { name: "View all" }));
        fireEvent.click(screen.getByRole("button", { name: "Next" }));

        expect(screen.queryByText("Alice")).not.toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();

        expect(screen.getByText("Charlie")).toBeInTheDocument();
        expect(screen.getByText("Diana")).toBeInTheDocument();

        expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });

    it("should collapse expanded member list", () => {
        renderEventMembersSection({
            members: manyMembers,
            previewLimit: 2,
            pageSize: 2
        });

        fireEvent.click(screen.getByRole("button", { name: "View all" }));
        fireEvent.click(screen.getByRole("button", { name: "Collapse" }));

        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();

        expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "View all" })).toBeInTheDocument();
    });
});
