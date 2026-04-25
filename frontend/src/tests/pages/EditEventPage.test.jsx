import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import EditEventPage from "../../pages/EditEventPage";

// ----------------------
// Mocks
// ----------------------

const mockNavigate = vi.fn();
const mockGetEventById = vi.fn();
const mockUpdateEvent = vi.fn();

// Router mock
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({
            eventId: "42"
        })
    };
});

// API mock
vi.mock("../../api/eventApi", () => ({
    getEventById: (...args) => mockGetEventById(...args),
    updateEvent: (...args) => mockUpdateEvent(...args)
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
            <EditEventPage />
        </MemoryRouter>
    );
}

const mockEventResponse = {
    data: {
        event: {
            id: 42,
            title: "Original Event",
            description: "Original description",
            type: "Meetup",
            theme: "Technology",
            mode: "in_person",
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z"
        }
    }
};

// ----------------------
// Tests
// ----------------------

describe("EditEventPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should display loading state initially", () => {
        mockGetEventById.mockResolvedValue(mockEventResponse);

        renderPage();

        expect(screen.getByText(/loading event form/i)).toBeInTheDocument();
    });

    it("should load and display existing event data", async () => {
        mockGetEventById.mockResolvedValue(mockEventResponse);

        renderPage();

        await waitFor(() => {
            expect(screen.getByDisplayValue("Original Event")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Original description")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Meetup")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Technology")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Montreal")).toBeInTheDocument();
        });
    });

    it("should show validation errors when submitting invalid form", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);

        renderPage();

        await waitFor(() => {
            expect(screen.getByDisplayValue("Original Event")).toBeInTheDocument();
        });

        const titleInput = screen.getByPlaceholderText(/event title/i);
        await user.clear(titleInput);

        await user.click(screen.getByRole("button", { name: /update event/i }));

        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(mockUpdateEvent).not.toHaveBeenCalled();
    });

    it("should hide location field when mode is online", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);

        renderPage();

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/event location/i)).toBeInTheDocument();
        });

        await user.selectOptions(screen.getByRole("combobox"), "online");

        expect(screen.queryByPlaceholderText(/event location/i)).not.toBeInTheDocument();
    });

    it("should update event and redirect to event details", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockResolvedValue({ data: { success: true } });

        renderPage();

        await waitFor(() => {
            expect(screen.getByDisplayValue("Original Event")).toBeInTheDocument();
        });

        const titleInput = screen.getByPlaceholderText(/event title/i);
        const descriptionInput = screen.getByPlaceholderText(/describe your event/i);

        await user.clear(titleInput);
        await user.type(titleInput, "Updated Event");

        await user.clear(descriptionInput);
        await user.type(descriptionInput, "Updated description");

        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const [eventId, payload] = mockUpdateEvent.mock.calls[0];

        expect(eventId).toBe("42");
        expect(payload.title).toBe("Updated Event");
        expect(payload.description).toBe("Updated description");
        expect(payload.mode).toBe("in_person");
        expect(payload.location).toBe("Montreal");

        expect(mockNavigate).toHaveBeenCalledWith("/events/42", { replace: true });
    });

    it("should update online event with null location", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockResolvedValue({ data: { success: true } });

        renderPage();

        await waitFor(() => {
            expect(screen.getByDisplayValue("Original Event")).toBeInTheDocument();
        });

        await user.selectOptions(screen.getByRole("combobox"), "online");
        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const [, payload] = mockUpdateEvent.mock.calls[0];

        expect(payload.mode).toBe("online");
        expect(payload.location).toBeNull();
    });

    it("should clear location when switching to online mode", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockResolvedValue({ data: { success: true } });

        renderPage();

        await waitFor(() => {
            expect(screen.getByDisplayValue("Original Event")).toBeInTheDocument();
        });

        await user.selectOptions(screen.getByRole("combobox"), "online");
        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const [, payload] = mockUpdateEvent.mock.calls[0];

        expect(payload.mode).toBe("online");
        expect(payload.location).toBeNull();
    });

    it("should show error message when loading event fails", async () => {
        mockGetEventById.mockRejectedValue(new Error("API error"));

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/unable to load event/i)).toBeInTheDocument();
        });
    });

    it("should show error message when update fails", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockRejectedValue(new Error("API error"));

        renderPage();

        await waitFor(() => {
            expect(screen.getByDisplayValue("Original Event")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => {
            expect(screen.getByText(/unable to update event/i)).toBeInTheDocument();
        });

        expect(mockNavigate).not.toHaveBeenCalledWith("/events/42", { replace: true });
    });

    it("should navigate back when clicking cancel", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);

        renderPage();

        await waitFor(() => {
            expect(screen.getByDisplayValue("Original Event")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(mockNavigate).toHaveBeenCalledWith("/events/42");
    });
});