import { useEffect, useMemo } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import TextArea from "../ui/TextArea";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import { getEventImage } from "../../utils/getEventImage";

/* ==================================================
   EVENT FORM
   Shared form for creating and editing events

   Handles:
   - event input fields
   - optional event image upload
   - validation error display
   - conditional UI
================================================== */

export default function EventForm({ form, errors, onChange, onFileChange, onRemoveFile, onSubmit, submitting, isEdit = false, isOnlineEvent, showCustomDeadline, onCancel }) {

    const selectedImagePreview = useMemo(() => {
        if (!form.image) return null;

        return URL.createObjectURL(form.image);
    }, [form.image]);

    useEffect(() => {
        return () => {
            if (selectedImagePreview) {
                URL.revokeObjectURL(selectedImagePreview);
            }
        };
    }, [selectedImagePreview]);

    const eventImagePreview = selectedImagePreview || getEventImage(form.currentImage);

    const getFileNameFromPath = (path) => {
        if (!path) return "";
        return path.split("/").pop();
    };

    return (
        <form onSubmit={onSubmit} className="event-form">
            <div className="event-image-section">
                <FormField label="Event image (optional)" error={errors.image}>
                    <div className="event-image-upload">
                        <label className="btn btn-outline event-image-upload-btn">
                            Choose file
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={onFileChange}
                                className="event-image-input-hidden"
                            />
                        </label>

                        <span className="event-image-input-hint">Optional • Max 3MB • JPG, PNG, WEBP or GIF</span>
                    </div>

                    {eventImagePreview && (
                        <div className="event-image-preview-card">
                            <img
                                src={eventImagePreview}
                                alt="Event preview"
                                className="event-image-preview"
                            />

                            <div className="event-image-preview-info">
                                {form.image ? (
                                    <>
                                        <span className="event-image-preview-name">{form.image.name}</span>
                                        <span className="event-image-preview-size">{(form.image.size / 1024).toFixed(1)} KB</span>
                                    </>
                                ) : form.currentImage ? (
                                    <>
                                        <span className="event-image-preview-name">{getFileNameFromPath(form.currentImage)}</span>
                                        <span className="event-image-preview-size">Uploaded image</span>
                                    </>
                                ) : (
                                    <span className="event-image-preview-name"> Default event image</span>
                                )}
                            </div>

                            <button type="button" className="btn btn-outline-danger event-image-remove-btn" onClick={onRemoveFile}>Remove</button>
                        </div>
                    )}
                </FormField>
            </div>

            <div className="form-grid">
                <FormField label="Title" error={errors.title}>
                    <Input
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        error={errors.title}
                    />
                </FormField>

                <FormField label="Type" error={errors.type}>
                    <Input
                        name="type"
                        value={form.type}
                        onChange={onChange}
                        error={errors.type}
                    />
                </FormField>

                <FormField label="Theme" error={errors.theme}>
                    <Input
                        name="theme"
                        value={form.theme}
                        onChange={onChange}
                        error={errors.theme}
                    />
                </FormField>

                <FormField label="Mode">
                    <Select name="mode" value={form.mode} onChange={onChange} error={errors.mode}>
                        <option value="in_person">In person</option>
                        <option value="online">Online</option>
                    </Select>
                </FormField>

                {!isOnlineEvent && (
                    <FormField label="Location" error={errors.location}>
                        <Input
                            name="location"
                            value={form.location}
                            onChange={onChange}
                            error={errors.location}
                        />
                    </FormField>
                )}

                <FormField label="Participant limit (optional)">
                    <Input
                        type="number"
                        name="maxParticipants"
                        value={form.maxParticipants}
                        onChange={onChange}
                    />
                </FormField>

                <FormField label="Description" className="form-field-full" error={errors.description}>
                    <TextArea
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        error={errors.description}
                    />
                </FormField>

                <FormField label="Start date" error={errors.startDate}>
                    <Input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={onChange}
                        error={errors.startDate}
                    />
                </FormField>

                <FormField label="Start time" error={errors.startTime}>
                    <Input
                        type="time"
                        name="startTime"
                        value={form.startTime}
                        onChange={onChange}
                        error={errors.startTime}
                    />
                </FormField>

                <FormField label="End date" error={errors.endDate}>
                    <Input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={onChange}
                        error={errors.endDate}
                    />
                </FormField>

                <FormField label="End time" error={errors.endTime}>
                    <Input
                        type="time"
                        name="endTime"
                        value={form.endTime}
                        onChange={onChange}
                        error={errors.endTime}
                    />
                </FormField>

                <FormField label="Registration deadline">
                    <Select name="registrationDeadlineOption" value={form.registrationDeadlineOption} onChange={onChange}>
                        <option value="none">No deadline</option>
                        <option value="day_before">1 day before event</option>
                        <option value="two_days_before">2 days before event</option>
                        <option value="custom">Custom date</option>
                    </Select>
                </FormField>

                {showCustomDeadline && (
                    <FormField label="Custom deadline">
                        <Input
                            type="datetime-local"
                            name="registrationDeadlineCustom"
                            value={form.registrationDeadlineCustom}
                            onChange={onChange}
                        />
                    </FormField>
                )}
            </div>

            <div className="form-actions">
                <Button type="submit" loading={submitting}>{isEdit ? "Update Event" : "Create Event"}</Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
            </div>
        </form>
    );
}
