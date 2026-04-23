import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MyEventsPage from "../../pages/MyEventsPage";

// ----------------------
// Mocks
// ----------------------

const mockGetMyEvents = vi.fn();
const mockHandleLeaveEvent = vi.fn();

// API mock
vi.mock("../../api/eventMembershipApi", () => ({
    getMyEvents: () => mockGetMyEvents()
}));

// Normalize mock
vi.mock("../../features/events/normalizeData", () => ({
    getMyEventsWithRole: (response) => response?.data?.events || []
}));

// Hook mock
vi.mock("../../hooks/useEventActionsWithConfirm", () => ({
    default: () => ({
        handleLeaveEvent: mockHandleLeaveEvent
    })
}));

// UI mocks
vi.mock("../../components/ui/LoadingState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/EmptyState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/Badge", () => ({
    default: ({ role }) => <span>{role}</span>
}));

// ----------------------
// Helper
// ----------------------

function renderPage() {
    return render(
        <MemoryRouter>
            <MyEventsPage />
        </MemoryRouter>
    );
}

// ----------------------
// Tests
// ----------------------

describe("MyEventsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should display loading state initially", async () => {
        mockGetMyEvents.mockResolvedValue({
            data: {
                events: []
            }
        });

        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });

    it("should display created and joined events in separate sections", async () => {
        mockGetMyEvents.mockResolvedValue({
            data: {
                events: [
                    { id: 1, title: "Created Event", role: "organizer" },
                    {
                        id: 2,
                        title: "Joined Event",
                        role: "participant",
                        creatorName: "Alice"
                    }
                ]
            }
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Created Event")).toBeInTheDocument();
            expect(screen.getByText("Joined Event")).toBeInTheDocument();
        });

        expect(screen.getByText(/created events/i)).toBeInTheDocument();
        expect(screen.getByText(/joined events/i)).toBeInTheDocument();
        expect(screen.getByText(/👑 Alice/i)).toBeInTheDocument();
    });

    it("should display empty states when user has no events", async () => {
        mockGetMyEvents.mockResolvedValue({
            data: {
                events: []
            }
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/no created events/i)).toBeInTheDocument();
            expect(screen.getByText(/no joined events/i)).toBeInTheDocument();
        });
    });

    it("should show leave button only for joined events", async () => {
        mockGetMyEvents.mockResolvedValue({
            data: {
                events: [
                    { id: 1, title: "Created Event", role: "organizer" },
                    { id: 2, title: "Joined Event", role: "participant" }
                ]
            }
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Created Event")).toBeInTheDocument();
            expect(screen.getByText("Joined Event")).toBeInTheDocument();
        });

        const leaveButtons = screen.getAllByRole("button", { name: /leave/i });
        expect(leaveButtons).toHaveLength(1);
    });

    it("should call handleLeaveEvent when clicking leave", async () => {
        const user = userEvent.setup();

        mockGetMyEvents.mockResolvedValue({
            data: {
                events: [{ id: 2, title: "Joined Event", role: "participant" }]
            }
        });

        renderPage();

        await waitFor(() => { expect(screen.getByText("Joined Event")).toBeInTheDocument() });

        await user.click(screen.getByRole("button", { name: /leave/i }));

        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(2);
    });

    it("should show error message when loading events fails", async () => {
        mockGetMyEvents.mockRejectedValue(new Error("API error"));

        renderPage();

        await waitFor(() => { expect(screen.getByText(/unable to load your events/i)).toBeInTheDocument() });
    });
});