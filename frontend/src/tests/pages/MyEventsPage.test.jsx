import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
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

            {event.role !== "organizer" && event.status !== "past" && (
                <button type="button" onClick={() => onLeave(event.id)}>Leave</button>
            )}

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

const LocationDisplay = () => {
    const location = useLocation();

    return <span data-testid="location-search">{location.search}</span>;
};

const renderPage = (initialEntry = "/my-events") =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <MyEventsPage />
            <LocationDisplay />
        </MemoryRouter>
    );

const getLastMyEventsCall = () =>
    mockGetMyEvents.mock.calls.at(-1)?.[0];

const expectLastMyEventsCall = async (expectedParams) => {
    await waitFor(() => {
        expect(getLastMyEventsCall()).toMatchObject(expectedParams);
    });
};

const getTabButton = (label) =>
    screen.getAllByRole("button").find((btn) =>
        btn.textContent.includes(label)
    );

describe("MyEventsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

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
            expect(mockGetMyEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    view: "created",
                    page: 1,
                    pageSize: 4,
                    sortBy: "startDateTime",
                    order: "asc"
                })
            );
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

        expect(await screen.findByText(/no created events/i)).toBeInTheDocument();
    });

    it("changes view when clicking Joined tab", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(createResponse())
            .mockResolvedValue(createResponse());

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(getTabButton("Joined"));

        expect(await screen.findByRole("heading", { level: 2, name: /joined events/i })).toBeInTheDocument();

        await expectLastMyEventsCall({
            view: "joined",
            page: 1,
            sortBy: "startDateTime",
            order: "asc"
        });
    });

    it("changes view when clicking Created History tab", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(createResponse())
            .mockResolvedValue(createResponse());

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(getTabButton("Created History"));

        expect(screen.getByRole("heading", { level: 2, name: /created history/i })).toBeInTheDocument();

        expect(getTabButton("Created History")).toHaveClass("active");

        await expectLastMyEventsCall({
            view: "createdHistory",
            page: 1,
            sortBy: "startDateTime",
            order: "asc"
        });
    });

    it("changes view when clicking Joined History tab", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(createResponse())
            .mockResolvedValue(createResponse());

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(getTabButton("Joined History"));

        expect(screen.getByRole("heading", { level: 2, name: /joined history/i })).toBeInTheDocument();

        expect(getTabButton("Joined History")).toHaveClass("active");

        await expectLastMyEventsCall({
            view: "joinedHistory",
            page: 1,
            sortBy: "startDateTime",
            order: "asc"
        });
    });

    it("calls API with sort params when applying filters", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(createResponse())
            .mockResolvedValue(createResponse());

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));

        const select = screen.getByDisplayValue(/soonest first/i);
        await user.selectOptions(select, "title-asc");

        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await expectLastMyEventsCall({
            view: "created",
            page: 1,
            sortBy: "title",
            order: "asc"
        });
    });

    it("loads events from URL query params", async () => {
        renderPage("/my-events?view=joined&creator=Luffy&page=2");

        await waitFor(() => {
            expect(mockGetMyEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    view: "joined",
                    creator: "Luffy",
                    page: 2,
                    pageSize: 4
                })
            );
        });
    });

    it("updates URL when switching view", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(getTabButton("Joined"));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("view=joined");
        });
    });

    it("updates URL when applying filters", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByPlaceholderText(/search by creator/i), "Luffy");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("creator=Luffy");
        });
    });

    it("updates URL when moving to next page", async () => {
        const user = userEvent.setup();

        mockGetMyEvents.mockResolvedValue(
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
        );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("page=2");
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

        await expectLastMyEventsCall({
            view: "created",
            page: 2,
            pageSize: 4
        });

        expect(await screen.findByText("Event Page 2")).toBeInTheDocument();
    });

    it("displays mixed event roles with pagination", async () => {
        const user = userEvent.setup();

        mockGetMyEvents
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 1,
                            title: "Created Mixed Event",
                            role: "organizer",
                            status: "upcoming"
                        },
                        {
                            id: 2,
                            title: "Joined Mixed Event",
                            role: "participant",
                            status: "upcoming"
                        }
                    ],
                    page: 1,
                    totalPages: 2,
                    totalEvents: 6
                })
            )
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 3,
                            title: "Second Page Event",
                            role: "co_organizer",
                            status: "upcoming"
                        }
                    ],
                    page: 2,
                    totalPages: 2,
                    totalEvents: 6
                })
            );

        renderPage();

        expect(await screen.findByText("Created Mixed Event")).toBeInTheDocument();
        expect(screen.getByText("Joined Mixed Event")).toBeInTheDocument();
        expect(screen.getByText("(6)")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await expectLastMyEventsCall({
            page: 2,
            pageSize: 4
        });

        expect(await screen.findByText("Second Page Event")).toBeInTheDocument();
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
