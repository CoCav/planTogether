import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../api/eventApi";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";
import LoadingState from "../components/ui/LoadingState";

export default function EditEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        type: "",
        theme: "",
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Load event data and pre-fill form
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getEventById(eventId);
                const event = response.data.event;

                setForm({
                    title: event.title || "",
                    description: event.description || "",
                    date: event.date ? event.date.slice(0, 10) : "",
                    location: event.location || "",
                    type: event.type || "",
                    theme: event.theme || "",
                });
            } catch (error) {
                console.error("Error loading event:", error);
                setError("❌ Unable to load event");
            } finally {
                setLoading(false);
            }
        };

    fetchEvent();}, [eventId]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };


   // Handle event update

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setSubmitting(true);

        try {
            await updateEvent(eventId, form);
            setMessage("✅ Event updated successfully");
            navigate(`/events/${eventId}`, {replace: true});
        } catch (error) {
            console.error("Error updating event:", error);
            setError("❌ Unable to update event");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container page-section">
                <LoadingState>Loading event form...</LoadingState>
            </div>
        );
    }

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
                            />
                        </FormField>

                        <FormField label="Type">
                            <Input
                                type="text"
                               name="type"
                               value={form.type}
                               onChange={handleChange}
                               placeholder="Event type"
                            />
                         </FormField>

                        <FormField label="Theme">
                            <Input
                               type="text"
                               name="theme"
                               value={form.theme}
                               onChange={handleChange}
                               placeholder="Event theme"
                            />
                        </FormField>

                        <FormField label="Description" className="form-field-full">
                            <Textarea
                               name="description"
                               value={form.description}
                               onChange={handleChange}
                               placeholder="Describe your event (what, where, for who...)"
                               rows={5}
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

                        <FormField label="Location">
                            <Input
                               type="text"
                               name="location"
                               value={form.location}
                               onChange={handleChange}
                               placeholder="Event location"
                            />
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