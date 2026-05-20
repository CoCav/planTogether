import { useEffect, useMemo, useState } from "react";

/* ==================================================
   USE FILE UPLOAD PREVIEW
   Handles reusable file upload preview behavior

   Handles:
   - selected file preview URL
   - existing file URL resolution
   - image preview eligibility
   - drag and drop state
   - dropped file forwarding
   - object URL cleanup

   Notes:
   - reusable for event images and avatars
   - current file URL resolution is provided by caller
================================================== */

export default function useFileUploadPreview({
    file,
    currentFile,
    fieldName = "file",
    allowedPreviewTypes = [],
    getCurrentFileUrl,
    onFileChange
}) {

    /* =============================
       DRAG STATE
    ============================= */

    const [isDragging, setIsDragging] = useState(false);

    /* =============================
       FILE STATE
    ============================= */

    const hasFile = Boolean(file || currentFile);

    // MIME type of the currently selected file
    const fileType = file?.type || "";

    // Indicates whether the selected file can generate a preview
    const canPreviewSelectedFile =
        Boolean(file) &&
        (
            allowedPreviewTypes.length === 0 ||
            allowedPreviewTypes.includes(fileType)
        );

    /* =============================
       FILE PREVIEW
    ============================= */

    // Preview generated from the newly selected file
    const selectedPreview = useMemo(() => {
        if (!file || !canPreviewSelectedFile) {
            return null;
        }

        return URL.createObjectURL(file);

    }, [
        file,
        canPreviewSelectedFile
    ]);

    // Preview resolved from an already uploaded file
    const currentFilePreview =
        currentFile && getCurrentFileUrl
            ? getCurrentFileUrl(currentFile)
            : null;


    // Final preview source shown in the UI
    const preview = selectedPreview || currentFilePreview;

    /* =============================
       PREVIEW CLEANUP
    ============================= */

    useEffect(() => {
        return () => {
            if (selectedPreview) {
                URL.revokeObjectURL(selectedPreview);
            }
        };
    }, [
        selectedPreview
    ]);

    /* =============================
       DROP HANDLING
    ============================= */

    const handleDrop = (event) => {
        event.preventDefault();

        setIsDragging(false);

        const droppedFile = event.dataTransfer.files?.[0];

        if (!droppedFile) {
            return;
        }

        onFileChange({
            target: {
                name: fieldName,
                files: [droppedFile]
            }
        });
    };

    return {
        isDragging,
        setIsDragging,
        hasFile,
        fileType,
        preview,
        handleDrop
    };
}
