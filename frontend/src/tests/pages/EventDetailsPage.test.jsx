import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import EventDetailsPage from "../../pages/EventDetailsPage";

// ----------------------
// Mocks
// ----------------------

const mockNavigate = vi.fn();
const mockGetEventById = vi.fn();
const mockGetEventMembers = vi.fn();
const mockGetEventOrganizers = vi.fn();
const mockDeleteEvent = vi.fn();

// Router mock
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ eventId: "1" })
    };
});

// Auth mock
vi.mock("../../context/useAuth", () => ({
    useAuth: () => ({
        user: { userId: 1 },
        loading: false
    })
}));

// API mocks
vi.mock("../../api/eventApi", () => ({
    getEventById: (...args) => mockGetEventById(...args),
    deleteEvent: (...args) => mockDeleteEvent(...args)
}));

vi.mock("../../api/eventMembershipApi", () => ({
    getEventMembers: (...args) => mockGetEventMembers(...args),
    getEventOrganizers: (...args) => mockGetEventOrganizers(...args)
}));

// Normalize mock
vi.mock("../../features/events/normalizeData", () => ({
    getNormalizedEvent: (res) => res.data.event,
    getNormalizedMembers: (res) => res.data.members || [],
    getNormalizedOrganizers: (res) => res.data.organizers || []
}));

// UI mocks
vi.mock("../../components/ui/LoadingState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/EmptyState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/Card", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/Button", () => ({
    default: ({ children, ...props }) => <button {...props}>{children}</button>
}));

vi.mock("../../components/ui/Badge", () => ({
    default: ({ role }) => <span>{role}</span>
}));

vi.mock("../../components/ui/Alert", () => ({
    default: ({ children }) => <div>{children}</div>
}));

// ----------------------
// Helper
// ----------------------

function renderPage() {
    return render(
        <MemoryRouter>
            <EventDetailsPage />
        </MemoryRouter>
    );
}

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
    participantCount: 0
};

// ----------------------
// Tests
// ----------------------

describe("EventDetailsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should display loading state initially", async () => {
        mockGetEventById.mockResolvedValue({ data: { event: mockEvent } });
        mockGetEventOrganizers.mockResolvedValue({ data: { organizers: [] } });
        mockGetEventMembers.mockResolvedValue({ data: { members: [] } });

        renderPage();

        expect(screen.getByText(/loading event details/i)).toBeInTheDocument();
    });

    it("should display event details", async () => {
        mockGetEventById.mockResolvedValue({ data: { event: mockEvent } });
        mockGetEventOrganizers.mockResolvedValue({ data: { organizers: [{ id: 1, name: "John", role: "organizer" }] } });
        mockGetEventMembers.mockResolvedValue({ data: { members: [] } });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Test Event")).toBeInTheDocument();
            expect(screen.getByText("Test description")).toBeInTheDocument();
            expect(screen.getByText("Montreal")).toBeInTheDocument();
        });
    });

    it("should show empty state when event not found", async () => {
        mockGetEventById.mockResolvedValue({ data: { event: null } });
        mockGetEventOrganizers.mockResolvedValue({ data: { organizers: [] } });
        mockGetEventMembers.mockResolvedValue({ data: { members: [] } });

        renderPage();

        await waitFor(() => { expect(screen.getByText(/event not found/i)).toBeInTheDocument() });
    });

    it("should show fallback when API fails", async () => {
        mockGetEventById.mockRejectedValue(new Error("API error"));

        renderPage();

        await waitFor(() => { expect(screen.getByText(/event not found/i)).toBeInTheDocument() });
    });

    it("should show delete button for organizer", async () => {
        mockGetEventById.mockResolvedValue({ data: { event: mockEvent } });
        mockGetEventOrganizers.mockResolvedValue({ data: { organizers: [{ id: 1, role: "organizer", name: "John" }] } });
        mockGetEventMembers.mockResolvedValue({ data: { members: [] } });

        renderPage();

        await waitFor(() => { expect(screen.getByRole("button", { name: /delete event/i })).toBeInTheDocument() });
    });

    it("should delete event and redirect", async () => {
        const user = userEvent.setup();

        window.confirm = vi.fn(() => true);

        mockGetEventById.mockResolvedValue({ data: { event: mockEvent } });
        mockGetEventOrganizers.mockResolvedValue({ data: { organizers: [{ id: 1, role: "organizer", name: "John" }] } });
        mockGetEventMembers.mockResolvedValue({ data: { members: [] } });
        mockDeleteEvent.mockResolvedValue({});

        renderPage();

        await waitFor(() => { expect(screen.getByRole("button", { name: /delete event/i })).toBeInTheDocument() });

        await user.click(screen.getByRole("button", { name: /delete event/i }));

        await waitFor(() => { expect(mockDeleteEvent).toHaveBeenCalledWith("1") });

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });
});