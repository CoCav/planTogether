import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateEventPage from "../../pages/CreateEventPage";

/* ==================================================
   CREATE EVENT PAGE TESTS
   Tests event creation page behavior

   Handles:
   - page rendering
   - required validation errors
   - event creation FormData payload
   - online event location normalization
   - image upload payload
   - API error feedback
   - cancel navigation

   Notes:
   - uses real EventForm and useEventForm behavior
   - mocks event creation API and navigation
================================================== */

const mockNavigate = vi.fn();
const mockCreateEvent = vi.fn();

/* =============================
   MOCKS
============================= */

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock("../../api/events/eventApi", () => ({
    createEvent: (...args) => mockCreateEvent(...args)
}));

/* =============================
   TEST HELPERS
============================= */

const renderPage = () => {
    return render(
        <MemoryRouter>
            <CreateEventPage />
        </MemoryRouter>
    );
};

const fillRequiredForm = async (user) => {
    await user.type(screen.getByLabelText(/^title$/i), "Tech Meetup");
    await user.type(screen.getByLabelText(/^type$/i), "Meetup");
    await user.type(screen.getByLabelText(/^theme$/i), "Technology");
    await user.type(screen.getByLabelText(/^location$/i), "Montreal");
    await user.type(screen.getByLabelText(/^description$/i), "A great event");

    await user.type(
        screen.getByLabelText(/^start date time$/i),
        "2026-12-20T10:00"
    );

    await user.type(
        screen.getByLabelText(/^end date time$/i),
        "2026-12-20T12:00"
    );
};

const getSubmittedFormData = () => {
    return mockCreateEvent.mock.calls.at(-1)?.[0];
};

describe("CreateEventPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockCreateEvent.mockResolvedValue({
            data: {
                id: 1
            }
        });

        globalThis.URL.createObjectURL = vi.fn(() => "blob:event-preview");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    /* =============================
       RENDERING
    ============================= */

    it("renders create event page", () => {
        renderPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: /create event/i
            })
        ).toBeInTheDocument();

        expect(screen.getByText(/fill in the details below/i)).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: /create event/i
        })).toBeInTheDocument();
    });

    /* =============================
       VALIDATION
    ============================= */

    it("displays validation errors when submitting empty form", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: /create event/i
        }));

        expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/theme is required/i)).toBeInTheDocument();
        expect(screen.getByText(/location is required/i)).toBeInTheDocument();
        expect(screen.getByText(/start date and time is required/i)).toBeInTheDocument();
        expect(screen.getByText(/end date and time is required/i)).toBeInTheDocument();

        expect(mockCreateEvent).not.toHaveBeenCalled();
    });

    /* =============================
       CREATE FLOW
    ============================= */

    it("creates an event with FormData payload", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillRequiredForm(user);

        await user.click(screen.getByRole("button", {
            name: /create event/i
        }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const formData = getSubmittedFormData();

        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get("title")).toBe("Tech Meetup");
        expect(formData.get("description")).toBe("A great event");
        expect(formData.get("type")).toBe("Meetup");
        expect(formData.get("theme")).toBe("Technology");
        expect(formData.get("mode")).toBe("in_person");
        expect(formData.get("location")).toBe("Montreal");
        expect(formData.get("startDateTime")).toBe("2026-12-20T10:00");
        expect(formData.get("endDateTime")).toBe("2026-12-20T12:00");
        expect(formData.get("registrationDeadline")).toBe("");
        expect(formData.has("image")).toBe(false);

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("creates an event with selected image", async () => {
        const user = userEvent.setup();

        const image = new File(["img"], "event.png", {
            type: "image/png"
        });

        renderPage();

        await fillRequiredForm(user);

        await user.upload(
            screen.getByLabelText(/choose file/i),
            image
        );

        await user.click(screen.getByRole("button", {
            name: /create event/i
        }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        expect(getSubmittedFormData().get("image")).toBe(image);
    });

    it("creates an online event with empty location", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(
            screen.getByLabelText(/^mode$/i),
            "online"
        );

        expect(screen.queryByLabelText(/^location$/i)).not.toBeInTheDocument();

        await user.type(screen.getByLabelText(/^title$/i), "Online Meetup");
        await user.type(screen.getByLabelText(/^type$/i), "Meetup");
        await user.type(screen.getByLabelText(/^theme$/i), "Technology");
        await user.type(screen.getByLabelText(/^description$/i), "A great online event");

        await user.type(
            screen.getByLabelText(/^start date time$/i),
            "2026-12-20T10:00"
        );

        await user.type(
            screen.getByLabelText(/^end date time$/i),
            "2026-12-20T12:00"
        );

        await user.click(screen.getByRole("button", {
            name: /create event/i
        }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        const formData = getSubmittedFormData();

        expect(formData.get("mode")).toBe("online");
        expect(formData.get("location")).toBe("");
    });

    it("creates an event with custom registration deadline", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillRequiredForm(user);

        await user.selectOptions(
            screen.getByLabelText(/^registration deadline$/i),
            "custom"
        );

        await user.type(
            screen.getByLabelText(/^custom deadline$/i),
            "2026-12-19T12:00"
        );

        await user.click(screen.getByRole("button", {
            name: /create event/i
        }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        expect(getSubmittedFormData().get("registrationDeadline")).toBe(
            new Date("2026-12-19T12:00").toISOString()
        );
    });

    it("creates an event with automatic registration deadline", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillRequiredForm(user);

        await user.selectOptions(
            screen.getByLabelText(/^registration deadline$/i),
            "day_before"
        );

        await user.click(screen.getByRole("button", {
            name: /create event/i
        }));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledTimes(1);
        });

        expect(getSubmittedFormData().get("registrationDeadline")).toBe(
            new Date("2026-12-19T10:00").toISOString()
        );
    });

    /* =============================
       ERROR FEEDBACK
    ============================= */

    it("displays error when event creation fails", async () => {
        const user = userEvent.setup();

        mockCreateEvent.mockRejectedValue(new Error("API error"));

        renderPage();

        await fillRequiredForm(user);

        await user.click(screen.getByRole("button", {
            name: /create event/i
        }));

        expect(await screen.findByText(/failed to create event/i)).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    /* =============================
       NAVIGATION
    ============================= */

    it("navigates back to events when cancelling", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: /cancel/i
        }));

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });
});
