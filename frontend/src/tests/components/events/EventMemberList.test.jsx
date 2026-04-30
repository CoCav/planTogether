import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EventMemberList from "../../../components/events/EventMemberList";

/* ==================================================
   EVENT MEMBER LIST TESTS
   Tests event member list rendering and actions
================================================== */

const members = [
    { id: 1, name: "Alice", role: "organizer" },
    { id: 2, name: "Bob", role: "participant" }
];

describe("EventMemberList", () => {
    it("renders title and subtitle", () => {
        render(
            <EventMemberList
                title="Participants"
                subtitle="People attending this event"
                members={members}
            />
        );

        expect(screen.getByText("Participants")).toBeInTheDocument();
        expect(screen.getByText("People attending this event")).toBeInTheDocument();
    });

    it("renders members", () => {
        render(<EventMemberList title="Members" members={members} />);

        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.getByText(/organizer/i)).toBeInTheDocument();
        expect(screen.getByText(/participant/i)).toBeInTheDocument();
    });

    it("renders empty state when no members exist", () => {
        render(
            <EventMemberList
                title="Members"
                members={[]}
                emptyMessage="No participants yet."
            />
        );

        expect(screen.getByText("No participants yet.")).toBeInTheDocument();
    });

    it("renders actions when enabled", () => {
        render(
            <EventMemberList
                title="Members"
                members={members}
                renderActions={(person) => (
                    <button type="button">Remove {person.name}</button>
                )}
            />
        );

        expect(screen.getByText("Remove Alice")).toBeInTheDocument();
        expect(screen.getByText("Remove Bob")).toBeInTheDocument();
    });

    it("does not render actions when disabled", () => {
        const renderActions = vi.fn((person) => (
            <button type="button">Remove {person.name}</button>
        ));

        render(
            <EventMemberList
                title="Members"
                members={members}
                showActions={false}
                renderActions={renderActions}
            />
        );

        expect(screen.queryByText(/remove alice/i)).not.toBeInTheDocument();
        expect(renderActions).not.toHaveBeenCalled();
    });
});
