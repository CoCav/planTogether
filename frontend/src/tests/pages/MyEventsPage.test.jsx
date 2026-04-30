import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MyEventsPage from "../../pages/MyEventsPage";

/* ==================================================
   MY EVENTS PAGE TESTS
   Tests user event views, filters, pagination and leave action
================================================== */

const mockGetMyEvents = vi.fn();
const mockHandleLeaveEvent = vi.fn();

let mockAuthState = {
    user: { userId: 1 }
};

vi.mock("../../context/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../api/eventMembershipApi", () => ({
    getMyEvents: (...args) => mockGetMyEvents(...args)
}));

vi.mock("../../features/events/normalizeData", () => ({
    getMyEventsWithRole: (response) => response?.data?.events || []
}));

vi.mock("../../hooks/events/useEventActionsWithConfirm", () => ({
    default: () => ({
        handleLeaveEvent: mockHandleLeaveEvent
    })
}));

vi.mock("../../components/events/EventCard", () => ({
    default: ({ event, onLeave }) => (
        <div>
            <span>{event.title}</span>

            {event.role !== "organizer" && event.status !== "past" && (<button type="button" onClick={() => onLeave(event.id)}>Leave</button>)}

            {event.status === "past" && <span>Ended</span>}
        </div>
    )
}));

const createResponse = ({ events = [], page = 1, pageSize = 4, totalPages = 1, totalEvents = events.length } = {}) => ({
    data: {
        events,
        page,
        pageSize,
        totalPages,
        totalEvents
    }
});

const renderPage = () =>
    render(
        <MemoryRouter>
            <MyEventsPage />
        </MemoryRouter>
    );

const getMyEventsCalls = () => mockGetMyEvents.mock.calls.map(([params]) => params);

const hasMyEventsCall = (expectedParams) =>
    getMyEventsCalls().some((params) =>
        Object.entries(expectedParams).every(
            ([key, value]) => params[key] === value
        )
    );

describe("MyEventsPage", () => {
    beforeEach(() => {
        mockGetMyEvents.mockReset();
        mockHandleLeaveEvent.mockReset();

        mockAuthState = {
            user: { userId: 1 }
        };

        mockGetMyEvents.mockResolvedValue(createResponse());
    });

    it("displays loading state initially", () => {
        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });

    it("calls API with default created view params", async () => {
        renderPage();

        await waitFor(() => {
            expect(
                hasMyEventsCall({
                    view: "created",
                    page: 1,
                    pageSize: 4,
                    sortBy: "startDateTime",
                    order: "asc"
                })
            ).toBe(true);
        });
    });

    it("displays events returned by API", async () => {
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

    it("displays empty state when current view has no events", async () => {
        renderPage();

        expect(await screen.findByText(/no upcoming events/i)).toBeInTheDocument();
    });

    it("changes view when clicking Joined tab", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(createResponse())
            .mockResolvedValue(createResponse());

        renderPage();

        await screen.findByText(/no upcoming events/i);

        await user.click(screen.getByRole("button", { name: /^joined$/i }));

        expect(await screen.findByText(/joined events/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(
                hasMyEventsCall({
                    view: "joined",
                    page: 1
                })
            ).toBe(true);
        });
    });

    it("calls API with sort params when applying filters", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(createResponse())
            .mockResolvedValue(createResponse());

        renderPage();

        await screen.findByText(/no upcoming events/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));

        const select = screen.getByDisplayValue(/soonest first/i);
        await user.selectOptions(select, "title-asc");

        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expect(
                hasMyEventsCall({
                    view: "created",
                    page: 1,
                    sortBy: "title",
                    order: "asc"
                })
            ).toBe(true);
        });
    });

    it("goes to next page", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 1,
                            title: "Event Page 1",
                            role: "organizer",
                            status: "upcoming"
                        }
                    ],
                    page: 1,
                    totalPages: 2,
                    totalEvents: 5
                })
            )
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 2,
                            title: "Event Page 2",
                            role: "organizer",
                            status: "upcoming"
                        }
                    ],
                    page: 2,
                    totalPages: 2,
                    totalEvents: 5
                })
            );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expect(
                hasMyEventsCall({
                    view: "created",
                    page: 2,
                    pageSize: 4
                })
            ).toBe(true);
        });

        expect(await screen.findByText("Event Page 2")).toBeInTheDocument();
    });

    it("calls handleLeaveEvent when clicking leave", async () => {
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

    it("shows error message when loading events fails", async () => {
        mockGetMyEvents.mockRejectedValue(new Error("API error"));

        renderPage();

        expect(await screen.findByText(/failed to load your events/i)).toBeInTheDocument();
    });
});
