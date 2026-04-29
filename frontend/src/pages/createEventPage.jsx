import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../api/eventApi";
import { validateEventForm } from "../features/events/eventValidation";

import EventForm from "../components/events/EventForm";

import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";

/* ==================================================
   CREATE EVENT PAGE
   Allows authenticated users to create a new event
   using the shared EventForm component.
================================================== */

export default function CreateEventPage() {
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    // Controls submit button loading state
    const [submitting, setSubmitting] = useState(false);

    // Stores create event form values
    const [form, setForm] = useState({
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
    });


    /* =========================
       Derived form state
       Controls conditional fields and payload values
    ========================= */

    const isOnlineEvent = form.mode === "online";
    const showCustomDeadline = form.registrationDeadlineOption === "custom";


    /* =========================
       Form input handling
       Updates form values and clears field errors
    ========================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            if (name === "mode" && value === "online") {
                return {
                    ...prev,
                    mode: value,
                    location: ""
                };
            }

            return {
                ...prev,
                [name]: value
            };
        });

        setErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    
    /* =========================
       Payload builders
       Converts form values into API-ready payload data
    ========================= */

    const buildDateTime = (date, time) => {
        if (!date || !time) return "";
        return new Date(`${date}T${time}`).toISOString();
    };

    const buildRegistrationDeadline = () => {
        if (!form.startDate || !form.startTime) return null;

        const eventStart = new Date(`${form.startDate}T${form.startTime}`);
        if (isNaN(eventStart.getTime())) return null;

        switch (form.registrationDeadlineOption) {
            case "day_before":
                return new Date(eventStart.getTime() - 24 * 60 * 60 * 1000).toISOString();

            case "two_days_before":
                return new Date(eventStart.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

            case "custom":
                return form.registrationDeadlineCustom ? new Date(form.registrationDeadlineCustom).toISOString() : null;

            default:
                return null;
        }
    };

    const buildPayload = () => ({
        title: form.title,
        description: form.description,
        type: form.type,
        theme: form.theme,
        mode: form.mode,
        location: isOnlineEvent ? null : form.location,
        startDateTime: buildDateTime(form.startDate, form.startTime),
        endDateTime: buildDateTime(form.endDate, form.endTime),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        registrationDeadline: buildRegistrationDeadline()
    });


    /* =========================
       Form submission
       Validates form and creates the event
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationErrors = validateEventForm(form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            await createEvent(buildPayload());
            navigate("/events");
        } catch (error) {
            console.error("Error creating event:", error);
            setError("Failed to create event");
        } finally {
            setSubmitting(false);
        }
    };


    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Create Event</h1>
                    <p className="page-subtitle">Fill in the details below to create a new event.</p>
                </div>
            </div>

            {error && <Alert type="danger">{error}</Alert>}

            <Card className="form-card">
                <EventForm
                    form={form}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    isOnlineEvent={isOnlineEvent}
                    showCustomDeadline={showCustomDeadline}
                    onCancel={() => navigate("/events")}
                />
            </Card>
        </div>
    );
}