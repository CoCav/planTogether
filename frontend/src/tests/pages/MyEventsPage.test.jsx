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

vi.mock("../../api/eventMembershipApi", () => ({
    getMyEvents: (...args) => mockGetMyEvents(...args)
}));

vi.mock("../../features/events/normalizeData", () => ({
    getMyEventsWithRole: (response) => response?.data?.events || []
}));

vi.mock("../../hooks/useEventActionsWithConfirm", () => ({
    default: () => ({
        handleLeaveEvent: mockHandleLeaveEvent
    })
}));

vi.mock("../../components/ui/EventCard", () => ({
    default: ({ event, onLeave }) => (
        <div>
            <span>{event.title}</span>

            {event.role !== "organizer" && event.status !== "past" && (
                <button type="button" onClick={() => onLeave(event.id)}>
                    Leave
                </button>
            )}

            {event.status === "past" && <span>Ended</span>}
        </div>
    )
}));

vi.mock("../../components/ui/LoadingState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/EmptyState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

// ----------------------
// Helpers
// ----------------------

const createResponse = ({ events = [], page = 1, pageSize = 4, totalPages = 1, totalEvents = events.length } = {}) => ({
    data: {
        events,
        page,
        pageSize,
        totalPages,
        totalEvents
    }
});

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

    it("should display loading state initially", () => {
        mockGetMyEvents.mockResolvedValue(createResponse());

        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });

    it("should call API with default created view params", async () => {
        mockGetMyEvents.mockResolvedValue(createResponse());

        renderPage();

        await waitFor(() => {
            expect(mockGetMyEvents).toHaveBeenCalledWith({
                view: "created",
                page: 1,
                pageSize: 4,
                sortBy: "startDateTime",
                order: "asc"
            });
        });
    });

    it("should display events returned by API", async () => {
        mockGetMyEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 1,
                        title: "Created Event",
                        role: "organizer",
                        status: "upcoming"
                    }
                ],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Created Event")).toBeInTheDocument();
        expect(screen.getByText(/created events/i)).toBeInTheDocument();
        expect(screen.getByText("(1)")).toBeInTheDocument();
    });

    it("should display empty state when current view has no events", async () => {
        mockGetMyEvents.mockResolvedValue(createResponse());

        renderPage();

        expect(await screen.findByText(/you haven’t created any events yet/i)).toBeInTheDocument();
    });

    it("should change view when clicking Joined tab", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(createResponse())
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 2,
                            title: "Joined Event",
                            role: "participant",
                            status: "upcoming"
                        }
                    ],
                    totalEvents: 1
                })
            );

        renderPage();

        await screen.findByText(/you haven’t created any events yet/i);

        await user.click(screen.getByRole("button", { name: /^joined$/i }));

        await waitFor(() => {
            expect(mockGetMyEvents).toHaveBeenLastCalledWith({
                view: "joined",
                page: 1,
                pageSize: 4,
                sortBy: "startDateTime",
                order: "asc"
            });
        });

        expect(await screen.findByText("Joined Event")).toBeInTheDocument();
    });

    it("should call API with sort params when changing sort option", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(createResponse())
            .mockResolvedValueOnce(createResponse());

        renderPage();

        await screen.findByText(/you haven’t created any events yet/i);

        await user.selectOptions(screen.getByRole("combobox"), "title-asc");

        await waitFor(() => {
            expect(mockGetMyEvents).toHaveBeenLastCalledWith({
                view: "created",
                page: 1,
                pageSize: 4,
                sortBy: "title",
                order: "asc"
            });
        });
    });

    it("should go to next page", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(
                createResponse({
                    events: [{ id: 1, title: "Event Page 1", role: "organizer" }],
                    page: 1,
                    totalPages: 2,
                    totalEvents: 5
                })
            )
            .mockResolvedValueOnce(
                createResponse({
                    events: [{ id: 2, title: "Event Page 2", role: "organizer" }],
                    page: 2,
                    totalPages: 2,
                    totalEvents: 5
                })
            );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expect(mockGetMyEvents).toHaveBeenLastCalledWith({
                view: "created",
                page: 2,
                pageSize: 4,
                sortBy: "startDateTime",
                order: "asc"
            });
        });

        expect(await screen.findByText("Event Page 2")).toBeInTheDocument();
    });

    it("should call handleLeaveEvent when clicking leave", async () => {
        const user = userEvent.setup();

        mockGetMyEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 2,
                        title: "Joined Event",
                        role: "participant",
                        status: "upcoming"
                    }
                ],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Joined Event")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /leave/i }));

        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(2);
    });

    it("should show error message when loading events fails", async () => {
        mockGetMyEvents.mockRejectedValue(new Error("API error"));

        renderPage();

        expect(await screen.findByText(/failed to load your events/i)).toBeInTheDocument();
    });
});