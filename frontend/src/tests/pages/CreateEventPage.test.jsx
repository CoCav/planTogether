import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CreateEventPage from "../../pages/CreateEventPage";

// ----------------------
// Mocks
// ----------------------

const mockNavigate = vi.fn();
const mockCreateEvent = vi.fn();

// Router mock
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// API mock
vi.mock("../../api/eventApi", () => ({
    createEvent: (...args) => mockCreateEvent(...args)
}));

// Validation mock
vi.mock("../../features/events/eventValidation", () => ({
    validateEventForm: vi.fn((form) => {
        const errors = {};

        if (!form.title) errors.title = "Title is required";
        if (!form.description) errors.description = "Description is required";
        if (!form.type) errors.type = "Type is required";
        if (!form.theme) errors.theme = "Theme is required";
        if (!form.startDate) errors.startDate = "Start date is required";
        if (!form.startTime) errors.startTime = "Start time is required";
        if (!form.endDate) errors.endDate = "End date is required";
        if (!form.endTime) errors.endTime = "End time is required";
        if (form.mode === "in_person" && !form.location) {
            errors.location = "Location is required";
        }

        return errors;
    })
}));

// ----------------------
// Helper
// ----------------------

function renderPage() {
    return render(
        <MemoryRouter>
            <CreateEventPage />
        </MemoryRouter>
    );
}

// ----------------------
// Tests
// ----------------------

describe("CreateEventPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render the create event form", () => {
        renderPage();

        expect(screen.getByRole("heading", { name: /create event/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/event title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/event type/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/event theme/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/describe your event/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/event location/i)).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /create event/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should show validation errors when submitting empty form", async () => {
        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole("button", { name: /create event/i }));

        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/theme is required/i)).toBeInTheDocument();
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/start time is required/i)).toBeInTheDocument();
        expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/end time is required/i)).toBeInTheDocument();
        expect(screen.getByText(/location is required/i)).toBeInTheDocument();

        expect(mockCreateEvent).not.toHaveBeenCalled();
    });

    it("should hide location field when mode is online", async () => {
        const user = userEvent.setup();
        renderPage();

        expect(screen.getByPlaceholderText(/event location/i)).toBeInTheDocument();

        await user.selectOptions(screen.getByRole("combobox"), "online");

        expect(screen.queryByPlaceholderText(/event location/i)).not.toBeInTheDocument();
    });

    it("should create an in-person event and redirect", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 1 } });

        renderPage();

        await user.type(screen.getByPlaceholderText(/event title/i), "Tech Meetup");
        await user.type(screen.getByPlaceholderText(/event type/i), "Meetup");
        await user.type(screen.getByPlaceholderText(/event theme/i), "Technology");
        await user.type(screen.getByPlaceholderText(/describe your event/i), "A great event");
        await user.type(screen.getByPlaceholderText(/event location/i), "Montreal");

        await user.type(document.querySelector('input[name="startDate"]'), "2026-12-20");
        await user.type(document.querySelector('input[name="startTime"]'), "10:00");
        await user.type(document.querySelector('input[name="endDate"]'), "2026-12-20");
        await user.type(document.querySelector('input[name="endTime"]'), "12:00");

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockCreateEvent.mock.calls[0][0];

        expect(payload.mode).toBe("in_person");
        expect(payload.location).toBe("Montreal");
        expect(payload.startDateTime).toContain("2026-12-20");

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("should create an online event with null location", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 2 } });

        renderPage();

        await user.type(screen.getByPlaceholderText(/event title/i), "Online Event");
        await user.type(screen.getByPlaceholderText(/event type/i), "Workshop");
        await user.type(screen.getByPlaceholderText(/event theme/i), "Learning");
        await user.type(screen.getByPlaceholderText(/describe your event/i), "Online only");

        await user.selectOptions(screen.getByRole("combobox"), "online");

        await user.type(document.querySelector('input[name="startDate"]'), "2026-12-21");
        await user.type(document.querySelector('input[name="startTime"]'), "14:00");
        await user.type(document.querySelector('input[name="endDate"]'), "2026-12-21");
        await user.type(document.querySelector('input[name="endTime"]'), "16:00");

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockCreateEvent.mock.calls[0][0];

        expect(payload.mode).toBe("online");
        expect(payload.location).toBeNull();

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("should clear location when switching to online mode", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 3 } });

        renderPage();

        await user.type(screen.getByPlaceholderText(/event title/i), "Online Event");
        await user.type(screen.getByPlaceholderText(/event type/i), "Workshop");
        await user.type(screen.getByPlaceholderText(/event theme/i), "Tech");
        await user.type(screen.getByPlaceholderText(/describe your event/i), "Online session");
        await user.type(screen.getByPlaceholderText(/event location/i), "Montreal");

        await user.selectOptions(screen.getByRole("combobox"), "online");

        await user.type(document.querySelector('input[name="startDate"]'), "2026-12-21");
        await user.type(document.querySelector('input[name="startTime"]'), "14:00");
        await user.type(document.querySelector('input[name="endDate"]'), "2026-12-21");
        await user.type(document.querySelector('input[name="endTime"]'), "16:00");

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockCreateEvent.mock.calls[0][0];

        expect(payload.mode).toBe("online");
        expect(payload.location).toBeNull();
    });

    it("should show error message when event creation fails", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockRejectedValue(new Error("API error"));

        renderPage();

        await user.type(screen.getByPlaceholderText(/event title/i), "Test");
        await user.type(screen.getByPlaceholderText(/event type/i), "Test");
        await user.type(screen.getByPlaceholderText(/event theme/i), "Test");
        await user.type(screen.getByPlaceholderText(/describe your event/i), "Test");
        await user.type(screen.getByPlaceholderText(/event location/i), "Test");

        await user.type(document.querySelector('input[name="startDate"]'), "2026-12-20");
        await user.type(document.querySelector('input[name="startTime"]'), "10:00");
        await user.type(document.querySelector('input[name="endDate"]'), "2026-12-20");
        await user.type(document.querySelector('input[name="endTime"]'), "12:00");

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to create event/i)).toBeInTheDocument();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should navigate back to events when clicking cancel", async () => {
        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });
});