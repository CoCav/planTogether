import { useEffect, useMemo, useState } from "react";
import { getAvatar } from "../../utils/getUploadedFile.js";

import FormField from "../ui/FormField";
import Input from "../ui/Input";

/* ==================================================
   AUTH FORM FIELDS
   Shared profile fields used by register and profile forms

   Handles:
   - name input
   - email input
   - optional avatar upload
   - drag and drop avatar selection
   - avatar preview and removal
================================================== */

export default function AuthFormFields({ form, errors, onChange, onFileChange, onRemoveFile, showAvatar = true }) {

    /* =========================
       Drag & drop state
       Tracks when user is dragging a file over the upload zone
    ========================= */
    const [isDragging, setIsDragging] = useState(false);


    /* =========================
       UI state helpers
       Indicates if a custom avatar exists
    ========================= */
    const hasCustomAvatar = Boolean(form.avatar || form.currentAvatar);


    /* =========================
       Selected avatar preview
       Creates a temporary URL for the uploaded avatar file
    ========================= */
    const selectedPreview = useMemo(() => {
        if (!form.avatar) return null;
        return URL.createObjectURL(form.avatar);
    }, [form.avatar]);


    /* =========================
       Preview resolution
       Determines which avatar to display:
       - selected file preview (priority)
       - existing avatar (profile mode)
       - no preview if none
    ========================= */
    const preview = selectedPreview || (form.currentAvatar ? getAvatar(form.currentAvatar) : null);


    /* =========================
       Preview cleanup
       Revokes object URL to avoid memory leaks
    ========================= */
    useEffect(() => {
        return () => {
            if (selectedPreview) {
                URL.revokeObjectURL(selectedPreview);
            }
        };
    }, [selectedPreview]);


    /* =========================
       File drop handling
       Converts dropped file into a standard input change event
    ========================= */
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        onFileChange({
            target: {
                name: "avatar",
                files: [file]
            }
        });

    };

    return (
        <div className="form-stack">
            {showAvatar && (
                <FormField label="Avatar (optional)" error={errors.avatar} className="avatar-form-field">
                    <div className={`avatar-upload-panel ${isDragging ? "drag-active" : ""}`}
                        onDragEnter={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                        }}
                        onDrop={handleDrop}>
                        <div className="avatar-upload">
                            <div className="avatar-upload-copy">
                                <span className="avatar-upload-title">Drag & drop an avatar here</span>
                                <span className="avatar-input-hint">Max 2MB • JPG, PNG, WEBP or GIF</span>
                            </div>

                            <label className="btn btn-outline avatar-upload-btn">
                                Choose file
                                <input
                                    type="file"
                                    name="avatar"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    className="avatar-input-hidden"
                                />
                            </label>
                        </div>

                        {preview && (
                            <div className="avatar-preview-card">
                                <img
                                    src={preview}
                                    alt="Avatar preview"
                                    className="avatar-preview"
                                />

                                <div className="avatar-preview-info">
                                    {form.avatar ? (
                                        <>
                                            <span className="avatar-preview-name">{form.avatar.name}</span>
                                            <span className="event-image-preview-size">{(form.avatar.size / 1024).toFixed(1)}{" "}KB</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="avatar-preview-name">Existing avatar</span>
                                            <span className="avatar-preview-size">Uploaded previously</span>
                                        </>
                                    )}
                                </div>

                                {hasCustomAvatar && (
                                    <button type="button" className="btn btn-outline-danger avatar-remove-btn" onClick={onRemoveFile}>Remove</button>
                                )}
                            </div>
                        )}
                    </div>
                </FormField>
            )}

            <FormField label="Name" error={errors.name}>
                <Input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Your name"
                    error={errors.name}
                />
            </FormField>

            <FormField label="Email" error={errors.email}>
                <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Your email"
                    error={errors.email}
                />
            </FormField>
        </div>
    );
}
