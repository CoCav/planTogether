import FileUploadPreviewField from "../forms/FileUploadPreviewField";

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
   - event image upload rendering
   - accessible form field descriptions
   - accessible invalid field states
   - validation error display
   - conditional field rendering
   - started event field restrictions

   Notes:
   - shared by create and edit flows
   - started events may lock specific fields during editing
================================================== */

export default function EventForm({
    values,
    fieldErrors,

    isStartDateTimeDisabled = false,

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

    return (
        <form onSubmit={onSubmit} className="form-layout">

            {/* =============================
               IMAGE
            ============================= */}

            <div className="event-form-image">
                <FileUploadPreviewField
                    variant="event"

                    label="Event image (optional)"
                    inputId="event-image"
                    fieldName="image"
                    accept="image/jpeg,image/png,image/webp,image/gif"

                    file={values.image}
                    currentFile={values.currentImage}
                    error={fieldErrors.image}

                    uploadAreaLabel="Event image upload area"
                    title="Drag & drop an image here"
                    hint="Max 3MB • JPG, PNG, WEBP or GIF"

                    previewAlt="Event preview"
                    existingFileLabel="Existing image"
                    removeLabel="Remove event image"

                    allowedPreviewTypes={[
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif"
                    ]}
                    getCurrentFileUrl={getEventImage}

                    onFileChange={onImageChange}
                    onRemoveFile={onRemoveImage}
                />
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
                            disabled={isStartDateTimeDisabled}
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
