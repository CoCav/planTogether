import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import EditEventPage from "../../pages/EditEventPage";

/* ==================================================
   EDIT EVENT PAGE TESTS
   Tests event loading, editing and update flow
================================================== */

const mockNavigate = vi.fn();
const mockGetEventById = vi.fn();
const mockUpdateEvent = vi.fn();

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

vi.mock("../../api/eventApi", () => ({
    getEventById: (...args) => mockGetEventById(...args),
    updateEvent: (...args) => mockUpdateEvent(...args)
}));

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
    }),
}));

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
            endDateTime: "2026-12-20T12:00:00.000Z",
            maxParticipants: 10,
            registrationDeadline: null
        },
    },
};

const renderPage = () =>
    render(
        <MemoryRouter>
            <EditEventPage />
        </MemoryRouter>
    );

const getField = (container, name) =>
    container.querySelector(`[name="${name}"]`);

const waitForFormToLoad = async () => {
    await screen.findByDisplayValue("Original Event");
};

describe("EditEventPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("displays loading state initially", () => {
        mockGetEventById.mockResolvedValue(mockEventResponse);

        renderPage();

        expect(screen.getByText(/loading event form/i)).toBeInTheDocument();
    });

    it("loads and displays existing event data", async () => {
        mockGetEventById.mockResolvedValue(mockEventResponse);

        renderPage();

        await waitForFormToLoad();

        expect(screen.getByDisplayValue("Original Event")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Original description")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Meetup")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Technology")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Montreal")).toBeInTheDocument();
    });

    it("shows validation errors when submitting invalid form", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);

        const { container } = renderPage();

        await waitForFormToLoad();

        await user.clear(getField(container, "title"));
        await user.click(screen.getByRole("button", { name: /update event/i }));

        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(mockUpdateEvent).not.toHaveBeenCalled();
    });

    it("hides location field when mode is online", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);

        const { container } = renderPage();

        await waitForFormToLoad();

        expect(getField(container, "location")).toBeInTheDocument();

        await user.selectOptions(getField(container, "mode"), "online");

        expect(getField(container, "location")).not.toBeInTheDocument();
    });

    it("updates event and redirects to event details", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockResolvedValue({ data: { success: true } });

        const { container } = renderPage();

        await waitForFormToLoad();

        await user.clear(getField(container, "title"));
        await user.type(getField(container, "title"), "Updated Event");

        await user.clear(getField(container, "description"));
        await user.type(getField(container, "description"), "Updated description");

        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const [eventId, payload] = mockUpdateEvent.mock.calls[0];

        expect(eventId).toBe("42");
        expect(payload).toMatchObject({
            title: "Updated Event",
            description: "Updated description",
            mode: "in_person",
            location: "Montreal"
        });

        expect(mockNavigate).toHaveBeenCalledWith("/events/42", {
            replace: true
        });
    });

    it("updates online event with null location", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockResolvedValue({ data: { success: true } });

        const { container } = renderPage();

        await waitForFormToLoad();

        await user.selectOptions(getField(container, "mode"), "online");
        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockUpdateEvent.mock.calls[0][1];

        expect(payload.mode).toBe("online");
        expect(payload.location).toBeNull();
    });

    it("builds registration deadline when option is selected", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockResolvedValue({ data: { success: true } });

        const { container } = renderPage();

        await waitForFormToLoad();

        await user.selectOptions(
            getField(container, "registrationDeadlineOption"),
            "day_before"
        );

        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockUpdateEvent.mock.calls[0][1];

        expect(payload.registrationDeadline).toBeTruthy();
    });

    it("shows loading state while submitting", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);

        let resolveRequest;
        mockUpdateEvent.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderPage();

        await waitForFormToLoad();

        await user.click(screen.getByRole("button", { name: /update event/i }));

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();

        resolveRequest({ data: { success: true } });
    });

    it("shows error message when loading event fails", async () => {
        mockGetEventById.mockRejectedValue(new Error("API error"));

        renderPage();

        expect(await screen.findByText(/unable to load event/i)).toBeInTheDocument();
    });

    it("shows error message when update fails", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockRejectedValue(new Error("API error"));

        renderPage();

        await waitForFormToLoad();

        await user.click(screen.getByRole("button", { name: /update event/i }));

        expect(await screen.findByText(/unable to update event/i)).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalledWith("/events/42", {
            replace: true
        });
    });

    it("navigates back when clicking cancel", async () => {
        const user = userEvent.setup();
        mockGetEventById.mockResolvedValue(mockEventResponse);

        renderPage();

        await waitForFormToLoad();

        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(mockNavigate).toHaveBeenCalledWith("/events/42");
    });
});
