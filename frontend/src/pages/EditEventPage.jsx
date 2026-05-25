import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCurrentUserEventAccess, getEventById, updateEvent } from "../api/events/eventApi";

import { createDefaultEventFormValues } from "../features/events/form/eventFormConfig";
import { buildEventUpdateFormPayloadData } from "../features/events/form/eventPayloadBuilder";
import { createEventFormValuesFromEvent } from "../features/events/form/eventFormValues";
import useEventForm from "../features/events/hooks/form/useEventForm";

import EventForm from "../components/events/EventForm";

import Alert from "../components/ui/Alert";
import Card from "../components/ui/Card";
import PageLoader from "../components/ui/PageLoader";

/* ==================================================
   EDIT EVENT PAGE
   Allows authorized users to update an existing event

   Handles:
   - event permission loading
   - protected event form access
   - event form loading
   - edit event form orchestration
   - update event submission
   - redirect after successful update
   - accessible form section

   Notes:
   - frontend permissions improve UX only
   - backend authorization remains the source of truth
================================================== */

export default function EditEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();


    /* =============================
       ACCESS STATE
    ============================= */

    const [canAccessEditForm, setCanAccessEditForm] = useState(false);

    /* =============================
       LOADING STATE
    ============================= */

    const [isLoading, setIsLoading] = useState(true);


    /* =============================
       SUBMIT HANDLER
    ============================= */

    const handleUpdateEvent = async (values) => {
        await updateEvent(
            eventId,
            buildEventUpdateFormPayloadData(values)
        );

        navigate(`/events/${eventId}`, {
            replace: true
        });
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
        onSubmitValid: handleUpdateEvent,
        submitErrorMessage: "Unable to update event",
        validationOptions: {
            allowPastDates: true
        }
    });

    const { values, setValues, fieldErrors } = formState;
    const { error, setError } = feedback;
    const { isSubmitting } = submitState;
    const { isOnlineEvent, showCustomDeadline } = formHelpers;

    const {
        handleFieldChange,
        handleImageChange,
        handleRemoveImage,
        handleSubmit
    } = formActions;


    /* =============================
       EVENT LOADING
    ============================= */

    const loadEvent = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const access = await getCurrentUserEventAccess(eventId);

            // Prevent unauthorized users from loading the edit form
            if (!access.canEdit) {
                setCanAccessEditForm(false);
                setError("You do not have permission to edit this event.");
                return;
            }

            const response = await getEventById(eventId);
            const event = response.event;

            // Allow rendering of the protected edit form
            setCanAccessEditForm(true);

            // Populate form with existing event values
            setValues(createEventFormValuesFromEvent(event));
        } catch (error) {
            console.error("Error loading event:", error);

            setError("Unable to load event");
        } finally {
            setIsLoading(false);
        }
    }, [
        eventId,
        setError,
        setValues
    ]);


    /* =============================
       INITIAL EVENT LOADING
    ============================= */

    useEffect(() => {
        loadEvent();
    }, [
        loadEvent
    ]);


    /* =============================
       NAVIGATION HANDLERS
    ============================= */

    const handleCancel = () => {
        navigate(`/events/${eventId}`);
    };


    /* =============================
       LOADING RENDER
    ============================= */

    if (isLoading) {
        return (
            <PageLoader>
                Loading event form...
            </PageLoader>
        );
    }


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <header className="page-header">
                <div className="page-header-content">
                    <h1 id="event-form-title" className="page-title">
                        Edit Event
                    </h1>

                    <p className="page-subtitle">
                        Update the event information below.
                    </p>
                </div>
            </header>

            {error && <Alert type="danger">{error}</Alert>}

            {canAccessEditForm && (
                <section className="event-form-section" aria-label="Edit event form">
                    <Card className="event-form-card">
                        <EventForm
                            values={values}
                            fieldErrors={fieldErrors}
                            submitLabel="Update Event"
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
            )}
        </main>
    );
}
