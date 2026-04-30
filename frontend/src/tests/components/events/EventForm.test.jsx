import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import EventForm from "../../../components/events/EventForm";

/* ==================================================
   EVENT FORM TESTS
   Tests shared create/edit event form rendering
================================================== */

const baseForm = {
    title: "",
    description: "",
    type: "",
    theme: "",
    mode: "in_person",
    location: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    maxParticipants: "",
    registrationDeadlineOption: "none",
    registrationDeadlineCustom: ""
};

describe("EventForm", () => {
    it("renders main event fields", () => {
        render(
            <EventForm
                form={baseForm}
                errors={{}}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                submitting={false}
                isOnlineEvent={false}
                showCustomDeadline={false}
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByText("Create Event")).toBeInTheDocument();
        expect(screen.getByText("Title")).toBeInTheDocument();
        expect(screen.getByText("Mode")).toBeInTheDocument();
        expect(screen.getByText("In person")).toBeInTheDocument();
    });

    it("hides location field for online events", () => {
        render(
            <EventForm
                form={{ ...baseForm, mode: "online" }}
                errors={{}}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                submitting={false}
                isOnlineEvent
                showCustomDeadline={false}
                onCancel={vi.fn()}
            />
        );

        expect(screen.queryByText("Location")).not.toBeInTheDocument();
    });

    it("shows custom deadline field when enabled", () => {
        render(
            <EventForm
                form={{ ...baseForm, registrationDeadlineOption: "custom" }}
                errors={{}}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                submitting={false}
                isOnlineEvent={false}
                showCustomDeadline
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByText("Custom deadline")).toBeInTheDocument();
    });

    it("renders edit submit label when isEdit is true", () => {
        render(
            <EventForm
                form={baseForm}
                errors={{}}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                submitting={false}
                isEdit
                isOnlineEvent={false}
                showCustomDeadline={false}
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /update event/i })).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted", () => {
        const onSubmit = vi.fn((e) => e.preventDefault());

        render(
            <EventForm
                form={baseForm}
                errors={{}}
                onChange={vi.fn()}
                onSubmit={onSubmit}
                submitting={false}
                isOnlineEvent={false}
                showCustomDeadline={false}
                onCancel={vi.fn()}
            />
        );

        fireEvent.submit(screen.getByRole("button", { name: /create event/i }).closest("form"));

        expect(onSubmit).toHaveBeenCalled();
    });

    it("calls onCancel when cancel button is clicked", () => {
        const onCancel = vi.fn();

        render(
            <EventForm
                form={baseForm}
                errors={{}}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                submitting={false}
                isOnlineEvent={false}
                showCustomDeadline={false}
                onCancel={onCancel}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(onCancel).toHaveBeenCalled();
    });
});
