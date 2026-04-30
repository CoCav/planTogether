import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import EventDetailsPage from "../../pages/EventDetailsPage";

/* ==================================================
   EVENT DETAILS PAGE TESTS
   Tests event details, permissions and member actions
================================================== */

const mockNavigate = vi.fn();
const mockGetEventById = vi.fn();
const mockGetEventMembers = vi.fn();
const mockGetEventOrganizers = vi.fn();
const mockUpdateMemberRole = vi.fn();
const mockRemoveEventMember = vi.fn();
const mockDeleteEvent = vi.fn();

let mockAuthState = {
    user: { userId: 1 },
    loading: false
};

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ eventId: "1" })
    };
});

vi.mock("../../context/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../api/eventApi", () => ({
    getEventById: (...args) => mockGetEventById(...args),
    deleteEvent: (...args) => mockDeleteEvent(...args)
}));

vi.mock("../../api/eventMembershipApi", () => ({
    getEventMembers: (...args) => mockGetEventMembers(...args),
    getEventOrganizers: (...args) => mockGetEventOrganizers(...args),
    updateMemberRole: (...args) => mockUpdateMemberRole(...args),
    removeEventMember: (...args) => mockRemoveEventMember(...args)
}));

vi.mock("../../features/events/normalizeData", () => ({
    getNormalizedEvent: (res) => res.data.event,
    getNormalizedMembers: (res) => res.data.members || [],
    getNormalizedOrganizers: (res) => res.data.organizers || []
}));

vi.mock("../../utils/format", () => ({
    formatEventDateRange: () => "Dec 20, 2026",
    formatTime: () => "10:00",
    formatCount: (count, label) => `${count} ${label}${count > 1 ? "s" : ""}`,
    formatBe: (count) => (count === 1 ? "is" : "are")
}));

const mockEvent = {
    id: 1,
    title: "Test Event",
    description: "Test description",
    mode: "in_person",
    location: "Montreal",
    type: "Meetup",
    theme: "Tech",
    startDateTime: "2026-12-20T10:00:00.000Z",
    endDateTime: "2026-12-20T12:00:00.000Z",
    participantCount: 0,
    status: "upcoming"
};

const setupApi = ({ event = mockEvent, organizers = [], members = [] } = {}) => {
    mockGetEventById.mockResolvedValue({ data: { event } });
    mockGetEventOrganizers.mockResolvedValue({ data: { organizers } });
    mockGetEventMembers.mockResolvedValue({ data: { members } });
};

const renderPage = () =>
    render(
        <MemoryRouter>
            <EventDetailsPage />
        </MemoryRouter>
    );

describe("EventDetailsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = {
            user: { userId: 1 },
            loading: false
        };
    });

    it("displays loading state initially", () => {
        setupApi();

        renderPage();

        expect(screen.getByText(/loading event details/i)).toBeInTheDocument();
    });

    it("displays event details", async () => {
        setupApi({
            organizers: [{ id: 1, name: "John", role: "organizer" }]
        });

        renderPage();

        expect(await screen.findByText("Test Event")).toBeInTheDocument();
        expect(screen.getByText("Test description")).toBeInTheDocument();
        expect(screen.getByText("Montreal")).toBeInTheDocument();
        expect(screen.getByText("Meetup")).toBeInTheDocument();
        expect(screen.getByText("Tech")).toBeInTheDocument();
    });

    it("shows empty state when event is not found", async () => {
        setupApi({
            event: null
        });

        renderPage();

        expect(await screen.findByText(/event not found/i)).toBeInTheDocument();
    });

    it("shows fallback when API fails", async () => {
        mockGetEventById.mockRejectedValue(new Error("API error"));
        mockGetEventOrganizers.mockResolvedValue({ data: { organizers: [] } });
        mockGetEventMembers.mockResolvedValue({ data: { members: [] } });

        renderPage();

        expect(await screen.findByText(/event not found/i)).toBeInTheDocument();
    });

    it("shows edit and delete buttons for organizer on active event", async () => {
        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }]
        });

        renderPage();

        expect(await screen.findByRole("button", { name: /delete event/i })).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /edit event/i })).toBeInTheDocument();
    });

    it("deletes event and redirects", async () => {
        const user = userEvent.setup();

        vi.spyOn(window, "confirm").mockReturnValue(true);

        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }]
        });

        mockDeleteEvent.mockResolvedValue({});

        renderPage();

        await screen.findByRole("button", { name: /delete event/i });

        await user.click(screen.getByRole("button", { name: /delete event/i }));

        await waitFor(() => {
            expect(mockDeleteEvent).toHaveBeenCalledWith("1");
        });

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("does not delete event when deletion is cancelled", async () => {
        const user = userEvent.setup();

        vi.spyOn(window, "confirm").mockReturnValue(false);

        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }]
        });

        renderPage();

        await screen.findByRole("button", { name: /delete event/i });

        await user.click(screen.getByRole("button", { name: /delete event/i }));

        expect(mockDeleteEvent).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalledWith("/events");
    });

    it("shows error when deleting event fails", async () => {
        const user = userEvent.setup();

        vi.spyOn(window, "confirm").mockReturnValue(true);

        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }]
        });

        mockDeleteEvent.mockRejectedValue(new Error("API error"));

        renderPage();

        await screen.findByRole("button", { name: /delete event/i });

        await user.click(screen.getByRole("button", { name: /delete event/i }));

        expect(
            await screen.findByText(/unable to delete event/i)
        ).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalledWith("/events");
    });

    it("shows ended label and hides event actions for past event", async () => {
        setupApi({
            event: {
                ...mockEvent,
                status: "past"
            },
            organizers: [{ id: 1, role: "organizer", name: "John" }]
        });

        renderPage();

        expect(await screen.findByText(/^ended$/i)).toBeInTheDocument();

        expect(screen.queryByRole("button", { name: /join the event/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /leave the event/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /edit event/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /delete event/i })).not.toBeInTheDocument();
    });

    it("shows past attendee empty state when no one attended", async () => {
        setupApi({
            event: {
                ...mockEvent,
                status: "past",
                participantCount: 0
            },
            organizers: [{ id: 1, role: "organizer", name: "John" }],
            members: []
        });

        renderPage();

        expect(await screen.findByText(/no one attended this event/i)).toBeInTheDocument();
    });

    it("shows active attendee empty state when there are no participants", async () => {
        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }],
            members: []
        });

        renderPage();

        expect(await screen.findByText(/no participants yet/i)).toBeInTheDocument();
    });

    it("shows ended login alert for unauthenticated user on past event", async () => {
        mockAuthState = {
            user: null,
            loading: false
        };

        setupApi({
            event: {
                ...mockEvent,
                status: "past"
            },
            organizers: [{ id: 1, role: "organizer", name: "John" }]
        });

        renderPage();

        expect(await screen.findByText(/this event has ended/i)).toBeInTheDocument();
        expect(screen.queryByText(/login to join this event/i)).not.toBeInTheDocument();
    });

    it("shows login alert for unauthenticated user on active event", async () => {
        mockAuthState = {
            user: null,
            loading: false
        };

        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }]
        });

        renderPage();

        expect(await screen.findByText(/login to join this event/i)).toBeInTheDocument();
    });

    it("shows login alert for unauthenticated user and no join button", async () => {
        mockAuthState = {
            user: null,
            loading: false
        };

        setupApi({
            event: {
                ...mockEvent,
                status: "upcoming"
            },
            organizers: [{ id: 2, role: "organizer", name: "Alice" }],
            members: []
        });

        renderPage();

        expect(await screen.findByText(/login to join this event/i)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /join/i })).not.toBeInTheDocument();
    });


    it("shows disabled full state when event has reached participant limit", async () => {
        setupApi({
            event: {
                ...mockEvent,
                participantCount: 10,
                maxParticipants: 10,
                status: "upcoming"
            },
            organizers: [{ id: 2, role: "organizer", name: "Alice" }],
            members: []
        });

        renderPage();

        const fullButton = await screen.findByRole("button", { name: /event full/i });

        expect(fullButton).toBeDisabled();
        expect(screen.queryByRole("button", { name: /join/i })).not.toBeInTheDocument();
    });

    it("promotes participant when organizer clicks Promote", async () => {
        const user = userEvent.setup();

        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }],
            members: [{ id: 2, name: "Alice", role: "participant" }]
        });

        mockUpdateMemberRole.mockResolvedValue({});

        renderPage();

        await screen.findByText("Alice");

        await user.click(screen.getByRole("button", { name: /promote/i }));

        expect(mockUpdateMemberRole).toHaveBeenCalledWith("1", 2, "co_organizer");
    });

    it("demotes co-organizer when organizer clicks Demote", async () => {
        const user = userEvent.setup();

        setupApi({
            organizers: [
                { id: 1, role: "organizer", name: "John" },
                { id: 2, role: "co_organizer", name: "Alice" }
            ],
            members: []
        });

        mockUpdateMemberRole.mockResolvedValue({});

        renderPage();

        await screen.findByText("Alice");

        await user.click(screen.getByRole("button", { name: /demote/i }));

        expect(mockUpdateMemberRole).toHaveBeenCalledWith("1", 2, "participant");
    });

    it("removes participant when organizer confirms removal", async () => {
        const user = userEvent.setup();

        vi.spyOn(window, "confirm").mockReturnValue(true);

        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }],
            members: [{ id: 2, name: "Alice", role: "participant" }]
        });

        mockRemoveEventMember.mockResolvedValue({});

        renderPage();

        await screen.findByText("Alice");

        await user.click(screen.getByRole("button", { name: /remove/i }));

        expect(mockRemoveEventMember).toHaveBeenCalledWith("1", 2);
    });

    it("does not remove participant when removal is cancelled", async () => {
        const user = userEvent.setup();

        vi.spyOn(window, "confirm").mockReturnValue(false);

        setupApi({
            organizers: [{ id: 1, role: "organizer", name: "John" }],
            members: [{ id: 2, name: "Alice", role: "participant" }]
        });

        renderPage();

        await screen.findByText("Alice");

        await user.click(screen.getByRole("button", { name: /remove/i }));

        expect(mockRemoveEventMember).not.toHaveBeenCalled();
    });

    it("allows co-organizer to remove participant but not promote", async () => {
        setupApi({
            organizers: [
                { id: 1, role: "co_organizer", name: "John" },
                { id: 3, role: "organizer", name: "Main Organizer" },
            ],
            members: [{ id: 2, name: "Alice", role: "participant" }]
        });

        renderPage();

        await screen.findByText("Alice");

        expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /promote/i })).not.toBeInTheDocument();
    });

    it("hides member management actions for past event", async () => {
        setupApi({
            event: {
                ...mockEvent,
                status: "past"
            },
            organizers: [{ id: 1, role: "organizer", name: "John" }],
            members: [{ id: 2, name: "Alice", role: "participant" }]
        });

        renderPage();

        await screen.findByText("Alice");

        expect(screen.queryByRole("button", { name: /promote/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /demote/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
    });
});
