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
    return { ...actual, useNavigate: () => mockNavigate };
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

const selectImage = async (user, file = new File(["img"], "event.png", { type: "image/png" })) => {
    await user.upload(screen.getByLabelText(/choose file/i), file);
    return file;
};

describe("CreateEventPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates event (FormData)", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 1 } });

        const { container } = renderPage();

        await fillRequiredForm(user, container);
        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => expect(mockCreateEvent).toHaveBeenCalled());

        const formData = mockCreateEvent.mock.calls[0][0];

        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get("title")).toBe("Tech Meetup");
        expect(formData.get("location")).toBe("Montreal");
        expect(formData.get("image")).toBeNull();

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("creates event with image", async () => {
        const user = userEvent.setup();
        const image = new File(["img"], "event.png", { type: "image/png" });

        mockCreateEvent.mockResolvedValue({ data: { id: 2 } });

        const { container } = renderPage();

        await fillRequiredForm(user, container);
        await selectImage(user, image);

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => expect(mockCreateEvent).toHaveBeenCalled());

        const formData = mockCreateEvent.mock.calls[0][0];

        expect(formData.get("image")).toBe(image);
    });

    it("creates online event", async () => {
        const user = userEvent.setup();
        mockCreateEvent.mockResolvedValue({ data: { id: 3 } });

        const { container } = renderPage();

        await fillRequiredForm(user, container);
        await user.selectOptions(getField(container, "mode"), "online");

        await user.click(screen.getByRole("button", { name: /create event/i }));

        await waitFor(() => expect(mockCreateEvent).toHaveBeenCalled());

        const formData = mockCreateEvent.mock.calls[0][0];

        expect(formData.get("mode")).toBe("online");
        expect(formData.get("location")).toBe("");
    });
});
