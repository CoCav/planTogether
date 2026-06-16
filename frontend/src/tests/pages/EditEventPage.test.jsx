import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditEventPage from "../../pages/EditEventPage";

/* ==================================================
   EDIT EVENT PAGE TESTS
   Tests event edit page behavior

   Handles:
   - loading state with contextual feedback
   - event access loading
   - protected edit form access
   - event form hydration
   - selected location hydration
   - location map preview rendering
   - accessible form section
   - existing image preview
   - event update FormData payload
   - nullable field clearing
   - image update payload
   - online mode location clearing
   - started event start date lock
   - validation feedback
   - API error feedback
   - cancel navigation

   Notes:
   - uses real EventForm and useEventForm behavior
   - mocks event loading, event update API and navigation
   - selectedLocation is hydrated from existing event coordinates
   - map preview only appears when a selected location exists
   - started events lock their original start datetime in the edit form
================================================== */

/* =============================
   MOCKS
============================= */

const mockNavigate = vi.fn();
const mockGetCurrentUserEventAccess = vi.fn();
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

vi.mock("../../api/events/eventApi", () => ({
    getCurrentUserEventAccess: (...args) => mockGetCurrentUserEventAccess(...args),
    getEventById: (...args) => mockGetEventById(...args),
    updateEvent: (...args) => mockUpdateEvent(...args)
}));

/* =============================
   TEST DATA
============================= */

const createDateTime = (daysOffset, hours = 10) => {
    const date = new Date();

    date.setDate(date.getDate() + daysOffset);
    date.setHours(hours, 0, 0, 0);

    return date.toISOString();
};

const mockEventResponse = {
    event: {
        id: 42,
        title: "Original Event",
        description: "Original description",
        type: "Meetup",
        theme: "Tech",
        mode: "in_person",

        location: "Montreal",
        locationLabel: "Montréal, Québec, Canada",
        latitude: 45.5017,
        longitude: -73.5673,

        startDateTime: createDateTime(30, 10),
        endDateTime: createDateTime(30, 12),

        maxParticipants: 20,
        registrationDeadline: createDateTime(29),

        image: "/uploads/events/event-current.png"
    }
};

/* =============================
   TEST HELPERS
============================= */

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

        mockGetCurrentUserEventAccess.mockResolvedValue({
            success: true,
            role: "organizer",
            status: "upcoming",
            canEdit: true,
            canDelete: true
        });

        mockGetEventById.mockResolvedValue(mockEventResponse);
        mockUpdateEvent.mockResolvedValue({});

        globalThis.URL.createObjectURL = vi.fn(() => "blob:event-preview");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    /* =============================
       LOADING / ACCESS
    ============================= */

    it("renders loading state before event is loaded", () => {
        mockGetCurrentUserEventAccess.mockReturnValue(new Promise(() => { }));

        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent(/loading event form/i);
        expect(screen.getByText(/please wait while we load this event's details/i)).toBeInTheDocument();
    });

    it("loads current user event access before loading event details", async () => {
        renderPage();

        await screen.findByDisplayValue("Original Event");

        expect(mockGetCurrentUserEventAccess).toHaveBeenCalledWith("42");
        expect(mockGetEventById).toHaveBeenCalledWith("42");
    });

    it("does not render edit form when user cannot edit event", async () => {
        mockGetCurrentUserEventAccess.mockResolvedValue({
            success: true,
            role: "participant",
            status: "upcoming",
            canEdit: false,
            canDelete: false
        });

        renderPage();

        expect(
            await screen.findByText(/you do not have permission to edit this event/i)
        ).toBeInTheDocument();

        expect(screen.queryByRole("region", {
            name: /edit event form/i
        })).not.toBeInTheDocument();

        expect(mockGetEventById).not.toHaveBeenCalled();
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

        expect(screen.getByLabelText(/^location$/i).value).toContain("Mont");

        expect(mockGetEventById).toHaveBeenCalledWith("42");
    });

    it("hydrates selected location and shows map preview when event has coordinates", async () => {
        renderPage();

        expect(await screen.findByDisplayValue("Original Event")).toBeInTheDocument();

        expect(screen.getByText(/location preview/i)).toBeInTheDocument();
    });

    it("does not show location map preview when loaded event has no coordinates", async () => {
        mockGetEventById.mockResolvedValue({
            event: {
                ...mockEventResponse.event,
                latitude: null,
                longitude: null
            }
        });

        renderPage();

        await screen.findByDisplayValue("Original Event");

        expect(screen.queryByText(/location preview/i)).not.toBeInTheDocument();
    });

    /* =============================
       DATE LOCK
    ============================= */

    it("keeps start datetime enabled for upcoming events", async () => {
        renderPage();

        expect(await screen.findByDisplayValue("Original Event")).toBeInTheDocument();

        expect(screen.getByLabelText(/start date & time/i)).toBeEnabled();
    });

    it("disables start datetime when loaded event has already started", async () => {
        mockGetEventById.mockResolvedValue({
            event: {
                ...mockEventResponse.event,
                startDateTime: createDateTime(-1),
                endDateTime: createDateTime(1),
                registrationDeadline: null
            }
        });

        renderPage();

        expect(await screen.findByDisplayValue("Original Event")).toBeInTheDocument();

        expect(screen.getByLabelText(/start date & time/i)).toBeDisabled();
        expect(screen.getByLabelText(/end date & time/i)).toBeEnabled();
    });

    /* =============================
       RENDERING
    ============================= */

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
        expect(formData.get("location")).toContain("Mont");

        expect(mockNavigate).toHaveBeenCalledWith("/events/42", {
            replace: true
        });
    });

    it("clears nullable event fields in update payload", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.clear(screen.getByLabelText(/participant limit/i));
        await user.selectOptions(screen.getByLabelText(/registration deadline/i), "none");

        await user.click(screen.getByRole("button", {
            name: /update event/i
        }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const formData = getSubmittedFormData();

        expect(formData.get("maxParticipants")).toBe("");
        expect(formData.get("registrationDeadline")).toBe("");
    });

    it("updates online event with empty location", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.selectOptions(screen.getByLabelText(/^mode$/i), "online");

        expect(screen.queryByLabelText(/^location$/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/location preview/i)).not.toBeInTheDocument();

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

    it("clears selected location when switching event mode to online", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByDisplayValue("Original Event");

        expect(screen.getByText(/location preview/i)).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText(/^mode$/i), "online");

        expect(screen.queryByText(/location preview/i)).not.toBeInTheDocument();
    });

    /* =============================
       IMAGE UPDATE
    ============================= */

    it("updates event with selected image after removing existing image", async () => {
        const user = userEvent.setup();

        const image = new File(["img"], "new-event.png", {
            type: "image/png"
        });

        renderPage();

        await screen.findByDisplayValue("Original Event");

        await user.click(screen.getByRole("button", {
            name: /remove event image/i
        }));

        await user.upload(screen.getByLabelText("Event image"), image);

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

        expect(getSubmittedFormData().has("image")).toBe(true);
        expect(getSubmittedFormData().get("image")).toBe("");
    });

    /* =============================
       VALIDATION
    ============================= */

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

    it("updates started event while keeping original start datetime locked", async () => {
        const user = userEvent.setup();

        mockGetEventById.mockResolvedValue({
            event: {
                ...mockEventResponse.event,
                startDateTime: createDateTime(-1),
                endDateTime: createDateTime(1),
                registrationDeadline: null
            }
        });

        renderPage();

        await screen.findByDisplayValue("Original Event");

        expect(screen.getByLabelText(/start date & time/i)).toBeDisabled();

        await user.clear(screen.getByLabelText(/^title$/i));
        await user.type(screen.getByLabelText(/^title$/i), "Updated Started Event");

        await user.click(screen.getByRole("button", {
            name: /update event/i
        }));

        await waitFor(() => {
            expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
        });

        const formData = getSubmittedFormData();

        expect(formData.get("title")).toBe("Updated Started Event");
        expect(formData.get("startDateTime")).toBeTruthy();
        expect(formData.get("endDateTime")).toBeTruthy();
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
