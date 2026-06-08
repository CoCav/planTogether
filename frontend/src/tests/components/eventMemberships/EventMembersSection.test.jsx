import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import EventMembersSection from "../../../components/eventMemberships/EventMembersSection";

import { createOrganizerMember, createParticipantMember } from "../../factories/eventMemberships/membershipPermissionsFactory";

/* ==================================================
   EVENT MEMBERS SECTION TESTS
   Tests reusable event members section rendering

   Handles:
   - section heading
   - optional subtitle
   - empty member state
   - member rows
   - public profile navigation
   - optional member actions
   - accessible section semantics
   - accessible list semantics
================================================== */

describe("EventMembersSection", () => {

    /* =============================
       TEST DATA
    ============================= */
    const members = [
        createOrganizerMember({
            id: 1,
            name: "Alice"
        }),
        createParticipantMember({
            id: 2,
            name: "Bob"
        })
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

        expect(
            screen.getByRole("heading", {
                name: "Participants"
            })
        ).toBeInTheDocument();

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

        const heading = screen.getByRole("heading", {
            name: "Participants"
        });

        expect(heading).toHaveAttribute("id", "participants-title");

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

    it("should link members to their public profile pages", () => {
        renderEventMembersSection();

        expect(screen.getByRole("link", {
            name: "Alice"
        })).toHaveAttribute("href", "/users/1");

        expect(screen.getByRole("link", {
            name: "Bob"
        })).toHaveAttribute("href", "/users/2");
    });

    /* =============================
       MEMBER ACTIONS
    ============================= */

    it("should render actions when actions are enabled", () => {
        renderEventMembersSection();

        expect(screen.getByText("Remove Alice")).toBeInTheDocument();
        expect(screen.getByText("Remove Bob")).toBeInTheDocument();
    });

    it("should call renderActions for each member when actions are enabled", () => {
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
});
