import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../api/eventApi";
import { validateEventForm } from "../features/events/eventValidation";


import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import TextArea from "../components/ui/TextArea";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";
import LoadingState from "../components/ui/LoadingState";

export default function EditEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    // Page loading state: controls loading scren while data is fetched
    const [loading, setLoading] = useState(true);

    // Submit loading state: controls login button loading
    const [submitting, setSubmitting] = useState(false);

    // Edit form state: stores event fields
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "",
        theme: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        mode: "in_person",
        location: "",
    });


    /* =========================
     Derived UI state
        Detects online mode to hide / disable location field
    ========================= */
    const isOnlineEvent = form.mode === "online";


    /* =========================
     Load event data
        Fetches current event information and pre-fills the form
    ========================= */
    useEffect(() => {
        const fetchEvent = async () => {
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
                });
            } catch (error) {
                console.error("Error loading event:", error);
                setError("❌ Unable to load event");
            } finally {
                setLoading(false);
            }
        };

    fetchEvent();}, [eventId]);


    /* =========================
     Input change handler
        Updates form values as the user edits fields
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
     Datetime builder
        Combines separate date and time fields into ISO strings
    ========================= */
    const buildDateTime = (date, time) => {
        if (!date || !time) return "";
        return new Date(`${date}T${time}`).toISOString();
    };


    /* =========================
     Submit handler
        Saves event updates and redirects to event details
    ========================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationErrors = validateEventForm(form, { allowPastStart: true });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            const payload = {
                title: form.title,
                description: form.description,
                type: form.type,
                theme: form.theme,
                mode: form.mode,
                startDateTime: buildDateTime(form.startDate, form.startTime),
                endDateTime: buildDateTime(form.endDate, form.endTime),
                location: isOnlineEvent ? null : form.location,
            };

            await updateEvent(eventId, payload);
            setMessage("✅ Event updated successfully");
            navigate(`/events/${eventId}`, {replace: true});
        } catch (error) {
            console.error("Error updating event:", error);
            setError("Unable to update event");
        } finally {
            setSubmitting(false);
        }
    };


    /* =========================
        Loading render
    ========================= */

    if (loading) {
        return (
            <div className="container page-section">
                <LoadingState>Loading event form...</LoadingState>
            </div>
        );
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
                <form onSubmit={handleSubmit} className="event-form">
                    <div className="form-grid">
                        <FormField label="Title">
                            <Input 
                                type="text" 
                                name="title" 
                                value={form.title} 
                                onChange={handleChange} 
                                placeholder="Event title" 
                                className={errors.title ? "error" : ""}
                            />
                            {errors.title && <p className="field-error">{errors.title}</p>}
                        </FormField>

                        <FormField label="Type">
                            <Input 
                                type="text" 
                                name="type" 
                                value={form.type} 
                                onChange={handleChange} 
                                placeholder="Event type" 
                                className={errors.type ? "error" : ""}
                            />
                            {errors.type && <p className="field-error">{errors.type}</p>}
                         </FormField>

                        <FormField label="Theme">
                            <Input 
                                type="text" 
                                name="theme" 
                                value={form.theme} 
                                onChange={handleChange} 
                                placeholder="Event theme" 
                                className={errors.theme ? "error" : ""}
                            />
                            {errors.theme && <p className="field-error">{errors.theme}</p>}
                        </FormField>

                        <FormField label="Mode">
                            <Select name="mode" value={form.mode} onChange={handleChange}> 
                                <option value="in_person">In person</option>
                                <option value="online">Online</option>
                            </Select>
                        </FormField>

                        <FormField label="Description" className="form-field-full">
                            <TextArea
                               name="description"
                               value={form.description}
                               onChange={handleChange}
                               placeholder="Describe your event (what, where, for who...)"
                               rows={5}
                               className={errors.description ? "error" : ""}
                             />
                            {errors.description && <p className="field-error">{errors.description}</p>}
                        </FormField>

                        {!isOnlineEvent && (
                            <FormField label="Location">
                                <Input
                                    type="text"
                                    name="location"
                                    placeholder="Event location"
                                    value={form.location}
                                    onChange={handleChange}
                                    className={errors.location ? "error" : ""}
                             />
                            {errors.location && <p className="field-error">{errors.location}</p>}
                            </FormField>
                        )}

                        <FormField label="Start date">
                            <Input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                               className={errors.startDate ? "error" : ""}
                             />
                            {errors.startDate && <p className="field-error">{errors.startDate}</p>}
                        </FormField>
                        <FormField label="Start time">
                            <Input
                                type="time"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                               className={errors.startTime ? "error" : ""}
                             />
                            {errors.startTime && <p className="field-error">{errors.startTime}</p>}
                        </FormField>

                         <FormField label="End date">
                            <Input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                               className={errors.endDate ? "error" : ""}
                             />
                            {errors.endDate && <p className="field-error">{errors.endDate}</p>}
                        </FormField>
                        <FormField label="End time">
                            <Input
                                type="time"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                               className={errors.endTime ? "error" : ""}
                             />
                            {errors.endTime && <p className="field-error">{errors.endTime}</p>}
                        </FormField>
                    </div>

                    <div className="form-actions">
                        <Button type="submit" loading={submitting}>Update Event</Button>
                        <Button type="button" variant="outline" onClick={() => navigate(`/events/${eventId}`)} disabled={submitting}>Cancel</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}