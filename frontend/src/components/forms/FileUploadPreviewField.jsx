import { UploadCloud } from "lucide-react";

import useFileUploadPreview from "../../hooks/useFileUploadPreview";

import FormField from "../ui/FormField";

/* ==================================================
   FILE UPLOAD PREVIEW FIELD
   Reusable file upload field with preview support

   Handles:
   - file input rendering when no preview is available
   - selected file preview display
   - existing file preview resolution
   - conditional dropzone / preview rendering
   - drag and drop interactions
   - file removal action
   - accessible helper and error descriptions
   - decorative upload icon rendering

   Notes:
   - reusable for avatar and event image uploads
   - preview URL resolution is provided by caller
================================================== */

export default function FileUploadPreviewField({
    variant = "default",

    label,
    inputId,
    fieldName,
    accept,

    file,
    currentFile,
    error,

    uploadAreaLabel,
    title,
    hint,

    previewAlt,
    existingFileLabel,
    removeLabel,

    allowedPreviewTypes,
    getCurrentFileUrl,

    onFileChange,
    onRemoveFile
}) {

    /* =============================
       FILE UPLOAD STATE
    ============================= */

    const {
        isDragging,
        setIsDragging,
        preview,
        hasFile,
        handleDrop
    } = useFileUploadPreview({
        file,
        currentFile,
        fieldName,
        allowedPreviewTypes,
        getCurrentFileUrl,
        onFileChange
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    // Links the upload input to helper text and validation errors
    const hintId = `${inputId}-hint`;

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <div className={`file-upload-preview-field ${variant}`.trim()}>
            <FormField label={label} htmlFor={inputId} error={error}>
                {(errorId) => (
                    <>
                        {!preview && (
                            <div
                                className={`file-upload-preview-dropzone ${isDragging ? "drag-active" : ""}`.trim()}
                                aria-label={uploadAreaLabel}

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
                                <div className="file-upload-preview-header">
                                    <div className="file-upload-preview-text">
                                        <UploadCloud
                                            className="file-upload-preview-icon"
                                            aria-hidden="true"
                                        />

                                        <span className="file-upload-preview-title">
                                            {title}
                                        </span>

                                        <span
                                            id={hintId}
                                            className="file-upload-preview-hint"
                                        >
                                            {hint}
                                        </span>
                                    </div>

                                    <label className="btn btn-outline">
                                        Choose file

                                        <input
                                            id={inputId}
                                            type="file"
                                            name={fieldName}
                                            accept={accept}
                                            onChange={onFileChange}
                                            className="file-upload-preview-input"
                                            aria-describedby={errorId
                                                ? `${hintId} ${errorId}`
                                                : hintId
                                            }
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {preview && (
                            <div className="file-upload-preview">
                                <img
                                    src={preview}
                                    alt={previewAlt}
                                    className="file-upload-preview-image"
                                />

                                <div className="file-upload-preview-info">
                                    {file ? (
                                        <>
                                            <span className="file-upload-preview-name">
                                                {file.name}
                                            </span>

                                            <span className="file-upload-preview-size">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="file-upload-preview-name">
                                                {existingFileLabel}
                                            </span>

                                            <span className="file-upload-preview-size">
                                                Uploaded previously
                                            </span>
                                        </>
                                    )}
                                </div>

                                {hasFile && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger file-upload-preview-remove"
                                        onClick={onRemoveFile}
                                        aria-label={removeLabel}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </FormField>
        </div>
    );
}
