import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CreateEventPage from "../../pages/CreateEventPage";

/* ==================================================
   CREATE EVENT PAGE TESTS
   Tests event creation flow and form behavior
================================================== */

const mockNavigate = vi.fn();
const mockCreateEvent = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../../api/eventApi", () => ({
    createEvent: (...args) => mockCreateEvent(...args),
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

const renderPage = () =>
    render(
        <MemoryRouter>
            <CreateEventPage />
        </MemoryRouter>
    );

const getField = (container, name) =>
    container.querySelector(`[name="${name}"]`);

const fillRequiredForm = async (user, container) => {
    await user.type(getField(container, "title"), "Tech Meetup");
    await user.type(getField(container, "type"), "Meetup");
    await user.type(getField(container, "theme"), "Technology");
    await user.type(getField(container, "description"), "A great event");
    await user.type(getField(container, "location"), "Montreal");

    await user.type(getField(container, "startDate"), "2026-12-20");
    await user.type(getField(container, "startTime"), "10:00");
    await user.type(getField(container, "endDate"), "2026-12-20");
    await user.type(getField(container, "endTime"), "12:00");
};

describe("CreateEventPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the create event page", () => {
        const { container } = renderPage();

        expect(screen.getByRole("heading", { name: /create event/i })).toBeInTheDocument();

        expect(getField(container, "title")).toBeInTheDocument();
        expect(getField(container, "type")).toBeInTheDocument();
        expect(getField(container, "theme")).toBeInTheDocument();
        expect(getField(container, "description")).toBeInTheDocument();
        expect(getField(container, "location")).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /create event/i })).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("shows validation errors when submitting empty form", async () => {
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

    it("hides location field when mode is online", async () => {
        const user = userEvent.setup();
        const { container } = renderPage();

        expect(getField(container, "location")).toBeInTheDocument();

        await user.selectOptions(getField(container, "mode"), "online");

        expect(getField(container, "location")).not.toBeInTheDocument();
    });

    it("creates an in-person event and redirects", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 1 } });

        const { container } = renderPage();

        await fillRequiredForm(user, container);

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockCreateEvent.mock.calls[0][0];

        expect(payload).toMatchObject({
            title: "Tech Meetup",
            type: "Meetup",
            theme: "Technology",
            description: "A great event",
            mode: "in_person",
            location: "Montreal"
        });

        expect(payload.startDateTime).toContain("2026-12-20");
        expect(payload.endDateTime).toContain("2026-12-20");
        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("creates an online event with null location", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 2 } });

        const { container } = renderPage();

        await fillRequiredForm(user, container);
        await user.selectOptions(getField(container, "mode"), "online");

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockCreateEvent.mock.calls[0][0];

        expect(payload.mode).toBe("online");
        expect(payload.location).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("clears location when switching to online mode", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 3 } });

        const { container } = renderPage();

        await fillRequiredForm(user, container);
        await user.selectOptions(getField(container, "mode"), "online");

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockCreateEvent.mock.calls[0][0];

        expect(payload.mode).toBe("online");
        expect(payload.location).toBeNull();
    });

    it("builds registration deadline when option is selected", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 4 } });

        const { container } = renderPage();

        await fillRequiredForm(user, container);
        await user.selectOptions(
            getField(container, "registrationDeadlineOption"),
            "day_before"
        );

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const payload = mockCreateEvent.mock.calls[0][0];

        expect(payload.registrationDeadline).toBeTruthy();
    });

    it("shows loading state while submitting", async () => {
        const user = userEvent.setup();

        let resolveRequest;
        mockCreateEvent.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        const { container } = renderPage();

        await fillRequiredForm(user, container);
        await user.click(screen.getByRole("button", { name: /create event/i }));

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();

        resolveRequest({ data: { id: 1 } });
    });

    it("shows error message when event creation fails", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockRejectedValue(new Error("API error"));

        const { container } = renderPage();

        await fillRequiredForm(user, container);
        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to create event/i)).toBeInTheDocument();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("navigates back to events when clicking cancel", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });
});
