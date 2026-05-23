import useFileUploadPreview from "../../hooks/useFileUploadPreview";

import { getAvatar } from "../../utils/uploadedFiles";

import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Input from "../ui/Input";

/* ==================================================
   USER FORM
   Shared user form for register and profile flows

   Handles:
   - user field rendering
   - avatar upload and preview
   - drag and drop interactions
   - accessible avatar upload interactions
   - accessible form field descriptions
   - accessible invalid field states
   - validation error display
   - form submission actions
================================================== */

export default function UserForm({
    values,
    fieldErrors,

    submitLabel,
    isSubmitting,

    showAvatar,

    onFieldChange,
    onAvatarChange = () => { },
    onRemoveAvatar = () => { },

    onSubmit,

    formFooter = null,

    children
}) {
    /* =============================
       FILE UPLOAD STATE
    ============================= */

    const {
        isDragging,
        setIsDragging,
        preview,
        hasFile: hasAvatar,
        handleDrop
    } = useFileUploadPreview({
        file: values.avatar,
        currentFile: values.currentAvatar,
        fieldName: "avatar",
        allowedPreviewTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ],
        getCurrentFileUrl: getAvatar,
        onFileChange: onAvatarChange
    });


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <form onSubmit={onSubmit} className="form-layout">

            {/* =============================
               AVATAR
            ============================= */}

            {showAvatar && (
                <div className="user-form-avatar">
                    <FormField label="Avatar (optional)" htmlFor="user-avatar" error={fieldErrors.avatar}>
                        {(errorId) => (
                            <div
                                className={`user-form-upload ${isDragging ? "drag-active" : ""}`}
                                aria-label="Avatar upload area"

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
                                <div className="user-form-upload-header">
                                    <div className="user-form-upload-text">
                                        <span className="user-form-upload-title">
                                            Drag & drop an avatar here
                                        </span>

                                        <span className="user-form-upload-hint">
                                            Max 2MB • JPG, PNG, WEBP or GIF
                                        </span>
                                    </div>

                                    <label className="btn btn-outline">
                                        Choose file

                                        <input
                                            id="user-avatar"
                                            type="file"
                                            name="avatar"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            onChange={onAvatarChange}
                                            className="user-form-upload-input"
                                            aria-describedby={errorId}
                                        />
                                    </label>
                                </div>

                                {preview && (
                                    <div className="user-form-preview">
                                        <img
                                            src={preview}
                                            alt="Avatar preview"
                                            className="user-form-preview-image"
                                        />

                                        <div className="user-form-preview-info">
                                            {values.avatar ? (
                                                <>
                                                    <span className="user-form-preview-name">
                                                        {values.avatar.name}
                                                    </span>

                                                    <span className="user-form-preview-size">
                                                        {(values.avatar.size / 1024).toFixed(1)} KB
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="user-form-preview-name">
                                                        Existing avatar
                                                    </span>

                                                    <span className="user-form-preview-size">
                                                        Uploaded previously
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {hasAvatar && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger user-form-preview-remove"
                                                onClick={onRemoveAvatar}
                                                aria-label="Remove avatar"
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
            )}

            {/* =============================
               FIELDS
            ============================= */}

            <div className="form-grid">
                <FormField label="Name" htmlFor="name" error={fieldErrors.name}>
                    {(errorId) => (
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={onFieldChange}
                            placeholder="Enter your name"
                            error={fieldErrors.name}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
                    {(errorId) => (
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={onFieldChange}
                            placeholder="e.g. john@example.com"
                            error={fieldErrors.email}
                            aria-describedby={errorId}
                        />
                    )}
                </FormField>

                {children}
            </div>

            {/* =============================
               ACTIONS
            ============================= */}

            <div className="form-actions">
                <Button type="submit" loading={isSubmitting}>
                    {submitLabel}
                </Button>
            </div>

            {/* =============================
               FOOTER
            ============================= */}

            {formFooter}
        </form>
    );
}
