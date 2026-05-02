import { useEffect, useMemo } from "react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";

/* ==================================================
   AUTH FORM FIELDS
   Shared profile fields used by register and profile forms

   Handles:
   - name input
   - email input
   - optional avatar upload
================================================== */

export default function AuthFormFields({ form, errors, onChange, onFileChange, onRemoveFile, showAvatar = true }) {

    // Generate a preview URL from the selected avatar file (derived value → useMemo)
    const avatarPreview = useMemo(() => {
        if (!form.avatar) return null;

        return URL.createObjectURL(form.avatar);
    }, [form.avatar]);

    // Cleanup: revoke the object URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    return (
        <div className="form-grid">

            {showAvatar && (
                <FormField label="Avatar (optional)" error={errors.avatar} className="avatar-form-field">
                    <div className="avatar-upload">
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

                        <span className="avatar-input-hint">Optional • Max 2MB • JPG, PNG, WEBP or GIF</span>
                    </div>

                    {form.avatar && avatarPreview && (
                        <div className="avatar-preview-card">
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="avatar-preview"
                            />

                            <div className="avatar-preview-info">
                                <span className="avatar-preview-name">{form.avatar.name}</span>
                                <span className="avatar-preview-size">{(form.avatar.size / 1024).toFixed(1)} KB</span>
                            </div>

                            <button type="button" className="btn btn-outline-danger avatar-remove-btn" onClick={onRemoveFile}>Remove</button>
                        </div>
                    )}
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
