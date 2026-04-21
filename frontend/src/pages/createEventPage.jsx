import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../api/eventApi";
import { validateEventForm } from "../features/events/eventValidation";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import TextArea from "../components/ui/TextArea";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    // Submit loading state: controls login button loading
    const [submitting, setSubmitting] = useState(false);

    // Create form state: stores new event fields
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
     Input change handler
        Saves form values as the user edits fields
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
        Build API payload and creates the event
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

            await createEvent(payload);
            navigate("/events");
        } catch (err) {
            console.error("Error creating event:", err);
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
                <form onSubmit={handleSubmit} className="event-form">
                    <div className="form-grid">
                        <FormField label="Title">
                            <Input
                                type="text"
                                name="title"
                                placeholder="Event title"
                                value={form.title}
                                onChange={handleChange}
                                className={errors.title ? "error" : ""}
                            />
                            {errors.title && <p className="field-error">{errors.title}</p>}
                        </FormField>

                        <FormField label="Type">
                            <Input
                                type="text"
                                name="type"
                                placeholder="Event type"
                                value={form.type}
                                onChange={handleChange}
                                className={errors.type ? "error" : ""}
                            />
                            {errors.type && <p className="field-error">{errors.type}</p>}
                        </FormField>

                        <FormField label="Theme">
                            <Input
                                type="text"
                                name="theme"
                                placeholder="Event theme"
                                value={form.theme}
                                onChange={handleChange}
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
                                placeholder="Describe your event (what, where, for who...)"
                                value={form.description}
                                onChange={handleChange}
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
                        <Button type="submit" loading={submitting}>Create Event</Button>

                        <Button type="button" variant="outline" onClick={() => navigate("/events")} disabled={submitting}>Cancel</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}