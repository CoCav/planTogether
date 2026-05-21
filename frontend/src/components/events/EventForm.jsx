import useFileUploadPreview from "../../hooks/useFileUploadPreview";

import { getEventImage } from "../../utils/uploadedFiles";

import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import TextArea from "../ui/TextArea";

/* ==================================================
   EVENT FORM
   Shared event form for create and edit flows

   Handles:
   - event field rendering
   - event image upload and preview
   - drag and drop interactions
   - accessible image upload interactions
   - accessible form field descriptions
   - accessible invalid field states
   - validation error display
   - conditional field rendering
================================================== */

export default function EventForm({
    values,
    fieldErrors,

    submitLabel,
    isSubmitting,

    isOnlineEvent,
    showCustomDeadline,

    onFieldChange,
    onImageChange,
    onRemoveImage,

    onSubmit,
    onCancel
}) {

    /* =============================
       FILE UPLOAD STATE
    ============================= */

    const {
        isDragging,
        setIsDragging,
        preview,
        hasFile: hasImage,
        handleDrop
    } = useFileUploadPreview({
        file: values.image,
        currentFile: values.currentImage,
        fieldName: "image",
        allowedPreviewTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ],
        getCurrentFileUrl: getEventImage,
        onFileChange: onImageChange
    });

    return (
        <form onSubmit={onSubmit} className="event-form">

            {/* =============================
               IMAGE
            ============================= */}

            <div className="event-form-image">
                <FormField label="Event image (optional)" htmlFor="event-image" error={fieldErrors.image}>
                    {(errorId) => (
                        <div
                            className={`event-form-upload ${isDragging ? "drag-active" : ""}`}
                            aria-label="Event image upload area"

                            onDragEnter={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={(event) => {
                                event.preventDefault();
                                setIsDragging(false);
                            }}
                            onDrop={handleDrop}
                        >
                            <div className="event-form-upload-header">
                                <div className="event-form-upload-text">
                                    <span className="event-form-upload-title">
                                        Drag & drop an image here
                                    </span>

                                    <span className="event-form-upload-hint">
                                        Max 3MB • JPG, PNG, WEBP or GIF
                                    </span>
                                </div>

                                <label className="btn btn-outline event-form-upload-button">
                                    Choose file

                                    <input
                                        id="event-image"
                                        type="file"
                                        name="image"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={onImageChange}
                                        className="event-form-upload-input"
                                        aria-describedby={errorId}
                                    />
                                </label>
                            </div>

                            {preview && (
                                <div className="event-form-preview">
                                    <img
                                        src={preview}
                                        alt="Event preview"
                                        className="event-form-preview-image"
                                    />

                                    <div className="event-form-preview-info">
                                        {values.image ? (
                                            <>
                                                <span className="event-form-preview-name">
                                                    {values.image.name}
                                                </span>

                                                <span className="event-form-preview-size">
                                                    {(values.image.size / 1024).toFixed(1)} KB
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="event-form-preview-name">
                                                    Existing image
                                                </span>

                                                <span className="event-form-preview-size">
                                                    Uploaded previously
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {hasImage && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger event-form-preview-remove"
                                            onClick={onRemoveImage}
                                            aria-label="Remove event image"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </FormField>
            </div>

            {/* =============================
               FIELDS
            ============================= */}

            <div className="form-grid">
                <FormField label="Title" htmlFor="title" error={fieldErrors.title}>
                    {(errorId) => (
                        <Input
                            id="title"
                            name="title"
                            value={values.title}
                            onChange={onFieldChange}
                            placeholder="e.g. Board game night"
                            error={fieldErrors.title}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                <FormField label="Type" htmlFor="type" error={fieldErrors.type}>
                    {(errorId) => (
                        <Input
                            id="type"
                            name="type"
                            value={values.type}
                            onChange={onFieldChange}
                            placeholder="e.g. Workshop, Meetup..."
                            error={fieldErrors.type}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                <FormField label="Theme" htmlFor="theme" error={fieldErrors.theme}>
                    {(errorId) => (
                        <Input
                            id="theme"
                            name="theme"
                            value={values.theme}
                            onChange={onFieldChange}
                            placeholder="e.g. Technology, Music..."
                            error={fieldErrors.theme}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                <FormField label="Mode" htmlFor="mode" error={fieldErrors.mode}>
                    {(errorId) => (
                        <Select
                            id="mode"
                            name="mode"
                            value={values.mode}
                            onChange={onFieldChange}
                            error={fieldErrors.mode}
                            aria-describedby={errorId}
                        >
                            <option value="in_person">In person</option>
                            <option value="online">Online</option>
                        </Select>
                    )}
                </FormField>

                {!isOnlineEvent && (
                    <FormField label="Location" htmlFor="location" error={fieldErrors.location}>
                        {(errorId) => (
                            <Input
                                id="location"
                                name="location"
                                value={values.location}
                                onChange={onFieldChange}
                                placeholder="e.g. Montreal"
                                error={fieldErrors.location}
                                aria-describedby={errorId}
                            />
                        )}
                    </FormField>
                )}

                <FormField label="Participant limit (optional)" htmlFor="maxParticipants">
                    {(errorId) => (
                        <Input
                            id="maxParticipants"
                            type="number"
                            name="maxParticipants"
                            value={values.maxParticipants}
                            onChange={onFieldChange}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                <FormField
                    label="Description"
                    htmlFor="description"
                    className="form-grid-column-full"
                    error={fieldErrors.description}
                >
                    {(errorId) => (
                        <TextArea
                            id="description"
                            name="description"
                            value={values.description}
                            onChange={onFieldChange}
                            placeholder="Describe your event"
                            error={fieldErrors.description}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                <FormField label="Start date time" htmlFor="startDateTime" error={fieldErrors.startDateTime}>
                    {(errorId) => (
                        <Input
                            id="startDateTime"
                            type="datetime-local"
                            name="startDateTime"
                            value={values.startDateTime}
                            onChange={onFieldChange}
                            error={fieldErrors.startDateTime}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                <FormField label="End date time" htmlFor="endDateTime" error={fieldErrors.endDateTime}>
                    {(errorId) => (
                        <Input
                            id="endDateTime"
                            type="datetime-local"
                            name="endDateTime"
                            value={values.endDateTime}
                            onChange={onFieldChange}
                            error={fieldErrors.endDateTime}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                <FormField label="Registration deadline" htmlFor="registrationDeadlineOption">
                    {(errorId) => (
                        <Select
                            id="registrationDeadlineOption"
                            name="registrationDeadlineOption"
                            value={values.registrationDeadlineOption}
                            onChange={onFieldChange}
                            aria-describedby={errorId}
                        >
                            <option value="none">No deadline</option>
                            <option value="day_before">1 day before event</option>
                            <option value="two_days_before">
                                2 days before event
                            </option>
                            <option value="custom">Custom date</option>
                        </Select>
                    )}
                </FormField>

                {showCustomDeadline && (
                    <FormField label="Custom deadline" htmlFor="registrationDeadlineCustom">
                        {(errorId) => (
                            <Input
                                id="registrationDeadlineCustom"
                                type="datetime-local"
                                name="registrationDeadlineCustom"
                                value={values.registrationDeadlineCustom}
                                onChange={onFieldChange}
                                aria-describedby={errorId}
                            />
                        )}
                    </FormField>
                )}
            </div>

            {/* =============================
               ACTIONS
            ============================= */}

            <div className="form-actions">
                <Button type="submit" loading={isSubmitting}>
                    {submitLabel}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
