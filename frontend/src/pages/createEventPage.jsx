import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../api/eventApi";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "",
        theme: "",
        date: "",
        location: "",
    });

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({
        ...form,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true)

        try {
            await createEvent(form);
            navigate("/events");
        } catch (err) {
            console.error("Error creating event:", err);
            setError("Failed to create event");
        } finally {
            setSubmitting(false);
        }
    };

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
                            />
                        </FormField>

                        <FormField label="Type">
                            <Input
                                type="text"
                                name="type"
                                placeholder="Event type"
                                value={form.type}
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Theme">
                            <Input
                                type="text"
                                name="theme"
                                placeholder="Event theme"
                                value={form.theme}
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Description" className="form-field-full">
                            <Textarea
                                name="description"
                                placeholder="Describe your event (what, where, for who...)"
                                value={form.description}
                                onChange={handleChange}
                                rows={5}
                            />
                        </FormField>

                        <FormField label="Location">
                            <Input
                                type="text"
                                name="location"
                                placeholder="Event location"
                                value={form.location}
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Date">
                            <Input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                            />
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