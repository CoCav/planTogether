import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../api/eventApi";

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

    const handleChange = (e) => {
        setForm({
        ...form,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await createEvent(form);
            navigate("/events");
        } catch (err) {
            console.error(err);
            setError("Failed to create event");
        }
    };

    return (
        <div>
            <h1>Create Event</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}/>

                <input
                type="text"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}/>

                <input
                type="text"
                name="type"
                placeholder="Type"
                value={form.type}
                onChange={handleChange}/>

                <input
                type="text"
                name="theme"
                placeholder="Theme"
                value={form.theme}
                onChange={handleChange}/>

                <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}/>

                <input
                type="text"
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}/>

                <button type="submit">Create</button>
            </form>
        </div>
    );
}