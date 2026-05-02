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
        useParams: () => ({ eventId: "42" })
    };
});

vi.mock("../../api/eventApi", () => ({
    getEventById: (...args) => mockGetEventById(...args),
    updateEvent: (...args) => mockUpdateEvent(...args)
}));

const mockEvent = {
    data: {
        event: {
            id: 42,
            title: "Original Event",
            description: "Original description",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            image: "/uploads/events/event-current.png"
        }
    }
};

const renderPage = () =>
    render(
        <MemoryRouter>
            <EditEventPage />
        </MemoryRouter>
    );

const selectImage = async (user, file = new File(["img"], "new.png", { type: "image/png" })) => {
    await user.upload(screen.getByLabelText(/choose file/i), file);
    return file;
};

describe("EditEventPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        globalThis.URL.createObjectURL = vi.fn(() => "blob:preview");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    it("loads event and shows image", async () => {
        mockGetEventById.mockResolvedValue(mockEvent);

        renderPage();

        await screen.findByDisplayValue("Original Event");

        expect(screen.getByAltText(/event preview/i)).toBeInTheDocument();
        expect(screen.getByText("event-current.png")).toBeInTheDocument();
    });

    it("updates event (FormData)", async () => {
        const user = userEvent.setup();

        mockGetEventById.mockResolvedValue(mockEvent);
        mockUpdateEvent.mockResolvedValue({});

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => expect(mockUpdateEvent).toHaveBeenCalled());

        const [id, formData] = mockUpdateEvent.mock.calls[0];

        expect(id).toBe("42");
        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get("title")).toBe("Original Event");
    });

    it("updates event with new image", async () => {
        const user = userEvent.setup();

        mockGetEventById.mockResolvedValue(mockEvent);
        mockUpdateEvent.mockResolvedValue({});

        renderPage();

        await screen.findByDisplayValue("Original Event");

        const image = await selectImage(user);

        await user.click(screen.getByRole("button", { name: /update event/i }));

        await waitFor(() => expect(mockUpdateEvent).toHaveBeenCalled());

        const [, formData] = mockUpdateEvent.mock.calls[0];

        expect(formData.get("image")).toBe(image);
    });
});
