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
   - started event start date protection
   - update event submission
   - redirect after successful update
   - accessible form section

   Notes:
   - frontend permissions improve UX only
   - backend authorization remains the source of truth
   - started events keep their original start datetime locked in the edit form
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
       DATE LOCK STATE
    ============================= */

    const [isStartDateTimeLocked, setIsStartDateTimeLocked] = useState(false);

    /* =============================
       HELPERS
    ============================= */

    const isPastOrStartedDateTime = (dateTime) => {
        const date = dateTime
            ? new Date(dateTime)
            : null;

        return (
            Boolean(date) &&
            !Number.isNaN(date.getTime()) &&
            date.getTime() <= Date.now()
        );
    };

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
            allowPastStartDateTime: isStartDateTimeLocked
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
        handleLocationSelect,
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

            const eventFormValues = createEventFormValuesFromEvent(event);

            // Lock start datetime when the existing event already started
            setIsStartDateTimeLocked(
                isPastOrStartedDateTime(eventFormValues.startDateTime)
            );

            // Allow rendering of the protected edit form
            setCanAccessEditForm(true);

            // Populate form with existing event values
            setValues(eventFormValues);

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
            <PageLoader
                title="Loading event form..."
                description="Please wait while we load this event's details."
            />
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

                            isStartDateTimeDisabled={isStartDateTimeLocked}
                            isOnlineEvent={isOnlineEvent}
                            showCustomDeadline={showCustomDeadline}

                            onFieldChange={handleFieldChange}
                            onImageChange={handleImageChange}
                            onRemoveImage={handleRemoveImage}
                            onSelectLocation={handleLocationSelect}

                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                        />
                    </Card>
                </section>
            )}
        </main>
    );
}
