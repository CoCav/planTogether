import FileUploadPreviewField from "../forms/FileUploadPreviewField";

import { getAvatar } from "../../utils/uploadedFiles";

import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Input from "../ui/Input";

/* ==================================================
   USER FORM
   Shared user form for register and profile flows

   Handles:
   - user field rendering
   - optional avatar upload rendering
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
       MAIN RENDER
    ============================= */

    return (
        <form onSubmit={onSubmit} className="form-layout">
            {showAvatar && (
                <FileUploadPreviewField
                    variant="avatar"

                    label="Avatar (optional)"
                    inputId="user-avatar"
                    fieldName="avatar"
                    accept="image/jpeg,image/png,image/webp,image/gif"

                    file={values.avatar}
                    currentFile={values.currentAvatar}
                    error={fieldErrors.avatar}

                    uploadAreaLabel="Avatar upload area"
                    title="Drag & drop an avatar here"
                    hint="Max 2MB • JPG, PNG, WEBP or GIF"

                    previewAlt="Avatar preview"
                    existingFileLabel="Existing avatar"
                    removeLabel="Remove avatar"

                    allowedPreviewTypes={[
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif"
                    ]}
                    getCurrentFileUrl={getAvatar}

                    onFileChange={onAvatarChange}
                    onRemoveFile={onRemoveAvatar}
                />
            )}

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

            <div className="form-actions">
                <Button type="submit" loading={isSubmitting}>
                    {submitLabel}
                </Button>
            </div>

            {formFooter}
        </form>
    );
}
