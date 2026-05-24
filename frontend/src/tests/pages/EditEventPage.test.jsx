import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditEventPage from "../../pages/EditEventPage";

/* ==================================================
   EDIT EVENT PAGE TESTS
   Tests event edit page behavior

   Handles:
   - loading state
   - event form hydration
   - accessible form section
   - existing image preview
   - event update FormData payload
   - image update payload
   - validation feedback
   - API error feedback
   - cancel navigation

   Notes:
   - uses real EventForm and useEventForm behavior
   - mocks event loading, event update API and navigation
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockNavigate = vi.fn();
const mockGetEventById = vi.fn();
const mockUpdateEvent = vi.fn();

/* =============================
   MOCKS
============================= */

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

vi.mock("../../api/events/eventApi", () => ({
    getEventById: (...args) => mockGetEventById(...args),
    updateEvent: (...args) => mockUpdateEvent(...args)
}));

/* =============================
   TEST HELPERS
============================= */

const mockEventResponse = {
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
        maxParticipants: 20,
        registrationDeadline: "2026-12-19T12:00:00.000Z",
        image: "/uploads/events/event-current.png"
    }
};

const renderPage = () => {
    return render(
        <MemoryRouter>
            <EditEventPage />
        </MemoryRouter>
    );
};

const getSubmittedFormData = () => {
    return mockUpdateEvent.mock.calls.at(-1)?.[1];
};

describe("EditEventPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockResolvedValue({});

        globalThis.URL.createObjectURL = vi.fn(() => "blob:event-preview");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    /* =============================
       LOADING
    ============================= */

    it("renders loading state before event is loaded", () => {
        mockGetEventById.mockReturnValue(
            new Promise(() => { })
        );

        renderPage();

        expect(screen.getByText(/loading event form/i)).toBeInTheDocument();
    });

    /* =============================
       FORM HYDRATION
    ============================= */

    it("loads event and hydrates form values", async () => {
        renderPage();

        expect(await screen.findByDisplayValue("Original Event")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Original description")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Meetup")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Tech")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Montreal")).toBeInTheDocument();
        expect(screen.getByDisplayValue("2026-12-20T10:00")).toBeInTheDocument();
        expect(screen.getByDisplayValue("2026-12-20T12:00")).toBeInTheDocument();
        expect(screen.getByDisplayValue("2026-12-19T12:00")).toBeInTheDocument();

        expect(mockGetEventById).toHaveBeenCalledWith("42");
    });

    it("renders accessible edit event form section", async () => {
        renderPage();

        expect(await screen.findByRole("heading", {
            level: 1,
            name: /edit event/i
        })).toHaveAttribute("id", "event-form-title");

        expect(screen.getByRole("region", {
            name: /edit event form/i
        })).toHaveClass("event-form-section");
    });

    it("shows current event image preview", async () => {
        renderPage();

        expect(await screen.findByAltText(/event preview/i)).toBeInTheDocument();
        expect(screen.getByText(/existing image/i)).toBeInTheDocument();
        expect(screen.getByText(/uploaded previously/i)).toBeInTheDocument();
    });

    /* =============================
       UPDATE FLOW
    ============================= */

    it("updates event with FormData payload", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.clear(screen.getByLabelText(/^title$/i));
        await user.type(screen.getByLabelText(/^title$/i), "Updated Event");

        await user.click(screen.getByRole("button", {
            name: /update event/i
        }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const [eventId] = mockUpdateEvent.mock.calls[0];
        const formData = getSubmittedFormData();

        expect(eventId).toBe("42");
        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get("title")).toBe("Updated Event");
        expect(formData.get("description")).toBe("Original description");
        expect(formData.get("type")).toBe("Meetup");
        expect(formData.get("theme")).toBe("Tech");
        expect(formData.get("mode")).toBe("in_person");
        expect(formData.get("location")).toBe("Montreal");
        expect(formData.get("startDateTime")).toBe("2026-12-20T10:00");
        expect(formData.get("endDateTime")).toBe("2026-12-20T12:00");

        expect(mockNavigate).toHaveBeenCalledWith("/events/42", {
            replace: true
        });
    });

    it("updates event with selected image", async () => {
        const user = userEvent.setup();

        const image = new File(["img"], "new-event.png", {
            type: "image/png"
        });

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.upload(
            screen.getByLabelText(/choose file/i),
            image
        );

        await user.click(screen.getByRole("button", {
            name: /update event/i
        }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        expect(getSubmittedFormData().get("image")).toBe(image);
    });

    it("updates event after removing existing image", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.click(screen.getByRole("button", {
            name: /remove/i
        }));

        await user.click(screen.getByRole("button", {
            name: /update event/i
        }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        expect(getSubmittedFormData().has("image")).toBe(false);
    });

    it("updates online event with empty location", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.selectOptions(
            screen.getByLabelText(/^mode$/i),
            "online"
        );

        expect(screen.queryByLabelText(/^location$/i)).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", {
            name: /update event/i
        }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const formData = getSubmittedFormData();

        expect(formData.get("mode")).toBe("online");
        expect(formData.get("location")).toBe("");
    });

    it("does not update event when validation fails", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.clear(screen.getByLabelText(/^title$/i));

        await user.click(screen.getByRole("button", {
            name: /update event/i
        }));

        expect(await screen.findByText(/title is required/i)).toBeInTheDocument();

        expect(mockUpdateEvent).not.toHaveBeenCalled();
    });

    /* =============================
       ERROR FEEDBACK
    ============================= */

    it("displays error when event loading fails", async () => {
        mockGetEventById.mockRejectedValue(new Error("API error"));

        renderPage();

        expect(await screen.findByText(/unable to load event/i)).toBeInTheDocument();

        expect(mockUpdateEvent).not.toHaveBeenCalled();
    });

    it("displays error when event update fails", async () => {
        const user = userEvent.setup();

        mockUpdateEvent.mockRejectedValue(new Error("API error"));

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.click(screen.getByRole("button", {
            name: /update event/i
        }));

        expect(await screen.findByText(/unable to update event/i)).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    /* =============================
       NAVIGATION
    ============================= */

    it("navigates back to event detail when cancelling", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.click(screen.getByRole("button", {
            name: /cancel/i
        }));

        expect(mockNavigate).toHaveBeenCalledWith("/events/42");
    });
});
