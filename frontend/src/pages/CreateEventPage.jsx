import { useNavigate } from "react-router-dom";

import { createEvent } from "../api/events/eventApi";

import { createDefaultEventFormValues } from "../features/events/form/eventFormConfig";
import { buildEventFormPayloadData } from "../features/events/form/eventPayloadBuilder";
import useEventForm from "../features/events/hooks/form/useEventForm";

import EventForm from "../components/events/EventForm";

import Alert from "../components/ui/Alert";
import Card from "../components/ui/Card";

/* ==================================================
   CREATE EVENT PAGE
   Allows authenticated users to create a new event

   Handles:
   - create event form orchestration
   - create event submission
   - redirect after successful creation
   - accessible form section
================================================== */

export default function CreateEventPage() {
    const navigate = useNavigate();


    /* =============================
       SUBMIT HANDLER
    ============================= */

    const handleCreateEvent = async (values) => {
        await createEvent(
            buildEventFormPayloadData(values)
        );

        navigate("/events");
    };


    /* =============================
       FORM STATE
    ============================= */

    const {
        formState,
        feedback,
        submitState,
        formHelpers,
        formActions
    } = useEventForm({
        initialValues: createDefaultEventFormValues(),
        onSubmitValid: handleCreateEvent,
        submitErrorMessage: "Failed to create event"
    });

    const { values, fieldErrors } = formState;
    const { error } = feedback;
    const { isSubmitting } = submitState;
    const { isOnlineEvent, showCustomDeadline } = formHelpers;

    const {
        handleFieldChange,
        handleImageChange,
        handleRemoveImage,
        handleSubmit
    } = formActions;


    /* =============================
       NAVIGATION HANDLERS
    ============================= */

    const handleCancel = () => {
        navigate("/events");
    };


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <header className="page-header">
                <div className="event-form-page-header">
                    <h1 id="event-form-title" className="page-title">
                        Create Event
                    </h1>

                    <p className="page-subtitle">
                        Fill in the details below to create a new event.
                    </p>
                </div>
            </header>

            {error && <Alert type="danger">{error}</Alert>}

            <section className="event-form-section" aria-labelledby="event-form-title">
                <Card className="event-form-card">
                    <EventForm
                        values={values}
                        fieldErrors={fieldErrors}

                        submitLabel="Create Event"
                        isSubmitting={isSubmitting}

                        isOnlineEvent={isOnlineEvent}
                        showCustomDeadline={showCustomDeadline}

                        onFieldChange={handleFieldChange}
                        onImageChange={handleImageChange}
                        onRemoveImage={handleRemoveImage}

                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </Card>
            </section>
        </main>
    );
}
