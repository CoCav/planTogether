import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../api/eventApi";

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

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // Load event data and pre-fill form
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await getEventById(eventId);
                const event = response.data.event;

                setForm({
                    title: event.title || "",
                    description: event.description || "",
                    date: event.date?.slice(0, 16) || "",
                    location: event.location || "",
                    type: event.type || "",
                    theme: event.theme || "",
                });
            } catch (error) {
                console.error("Error loading event:", error);
                setError("❌ Unable to load event");
            }
        };

    fetchEvent();}, [eventId]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };


   // Handle event update

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await updateEvent(eventId, form);

            setMessage("✅ Event updated successfully");

            // Redirect to event details
            setTimeout(() => {
                navigate(`/events/${eventId}`);
            }, 1000);
        } catch (error) {
            console.error("Error updating event:", error);
            setError("❌ Unable to update event");
        }
    };

    return (
        <div>
            <h1>Edit Event</h1>

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"/>

                <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"/>

                <input
                    type="datetime-local"
                    name="date"
                    value={form.date}
                    onChange={handleChange}/>

                <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Location"/>

                <input
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    placeholder="Type"/>

                <input
                    name="theme"
                    value={form.theme}
                    onChange={handleChange}
                    placeholder="Theme"/>

                <button type="submit">Update Event</button>
            </form>
        </div>
    );
}