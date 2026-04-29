import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../api/eventApi";
import { validateEventForm } from "../features/events/eventValidation";

import EventForm from "../components/events/EventForm";

import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import PageLoading from "../components/ui/PageLoading";

/* ==================================================
   EDIT EVENT PAGE
   Allows authorized users to update an existing event
   using the shared EventForm component.
================================================== */

export default function EditEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    // Controls full-page loading while event data is fetched
    const [loading, setLoading] = useState(true);

    // Controls submit button loading state
    const [submitting, setSubmitting] = useState(false);

    // Stores edit event form values
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
       Event form loading
       Fetches current event and pre-fills form values
    ========================= */

    const loadEvent = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getEventById(eventId);
            const event = response.data.event;

            const start = event.startDateTime ? new Date(event.startDateTime) : null;
            const end = event.endDateTime ? new Date(event.endDateTime) : null;

            setForm({
                title: event.title || "",
                description: event.description || "",
                type: event.type || "",
                theme: event.theme || "",
                mode: event.mode || "in_person",
                location: event.location || "",
                startDate: start ? start.toISOString().slice(0, 10) : "",
                startTime: start ? start.toISOString().slice(11, 16) : "",
                endDate: end ? end.toISOString().slice(0, 10) : "",
                endTime: end ? end.toISOString().slice(11, 16) : "",
                maxParticipants: event.maxParticipants || "",
                registrationDeadlineOption: event.registrationDeadline ? "custom" : "none",
                registrationDeadlineCustom: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : ""
            });
        } catch (error) {
            console.error("Error loading event:", error);
            setError("❌ Unable to load event");
        } finally {
            setLoading(false);
        }
    }, [eventId]);


    /* =========================
       Initial event loading
    ========================= */

    useEffect(() => {
        loadEvent();
    }, [loadEvent]);



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
       Validates form and updates the event
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationErrors = validateEventForm(form, {
            allowPastStart: true,
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            await updateEvent(eventId, buildPayload());
            setMessage("✅ Event updated successfully");
            navigate(`/events/${eventId}`, { replace: true });
        } catch (error) {
            console.error("Error updating event:", error);
            setError("Unable to update event");
        } finally {
            setSubmitting(false);
        }
    };


    /* =========================
       Loading state
    ========================= */

    if (loading) {
        return <PageLoading>Loading event form...</PageLoading>;
    }


    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Edit Event</h1>
                    <p className="page-subtitle">Update the event information below.</p>
                </div>
            </div>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <Card className="form-card">
                <EventForm
                    form={form}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    isEdit
                    isOnlineEvent={isOnlineEvent}
                    showCustomDeadline={showCustomDeadline}
                    onCancel={() => navigate(`/events/${eventId}`)}
                />
            </Card>
        </div>
    );
}