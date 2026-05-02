import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../api/eventApi";
import { validateEventForm } from "../features/events/eventValidation";

import EventForm from "../components/events/EventForm";

import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import PageLoader from "../components/ui/PageLoader";

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
        registrationDeadlineCustom: "",
        image: null,
        currentImage: null
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
       Image input handling
       Stores selected file and clears avatar error
    ========================= */

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;

        setForm((prev) => ({
            ...prev,
            image: file
        }));

        setErrors((prev) => ({
            ...prev,
            image: undefined
        }));
    };

    const handleRemoveImage = () => {
        setForm((prev) => ({
            ...prev,
            image: null,
            currentImage: null
        }));

        setErrors((prev) => ({
            ...prev,
            image: undefined
        }));
    };


    /* =========================
       Form submission
       Validates form and updates the event
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const validationErrors = validateEventForm(form, {
            allowPastStart: true
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            await updateEvent(eventId, buildFormData());
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
                registrationDeadlineCustom: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : "",
                image: null,
                currentImage: event.image || null
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
                return form.registrationDeadlineCustom
                    ? new Date(form.registrationDeadlineCustom).toISOString()
                    : null;

            default:
                return null;
        }
    };

    const buildFormData = () => {
        const formData = new FormData();

        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("type", form.type);
        formData.append("theme", form.theme);
        formData.append("mode", form.mode);
        formData.append("location", isOnlineEvent ? "" : form.location);
        formData.append("startDateTime", buildDateTime(form.startDate, form.startTime));
        formData.append("endDateTime", buildDateTime(form.endDate, form.endTime));

        if (form.maxParticipants) {
            formData.append("maxParticipants", form.maxParticipants);
        }

        const registrationDeadline = buildRegistrationDeadline();

        if (registrationDeadline) {
            formData.append("registrationDeadline", registrationDeadline);
        }

        if (form.image) {
            formData.append("image", form.image);
        }

        return formData;
    };


    /* =========================
       Loading state
    ========================= */

    if (loading) {
        return <PageLoader>Loading event form...</PageLoader>;
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
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveImage}
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
