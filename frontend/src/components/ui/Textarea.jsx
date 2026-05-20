/* ==================================================
   TEXTAREA
   Reusable styled textarea component

   Handles:
   - shared textarea styling
   - validation error state
   - configurable rows
   - resize behavior
   - custom class names
================================================== */

export default function TextArea({
    rows = 4,
    resize = "vertical",
    error,
    className = "",
    ...props
}) {

    /* =============================
       CSS CLASSES
    ============================= */

    const textareaClasses = [
        "textarea",
        `textarea-resize-${resize}`,
        error && "error",
        className
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <textarea
            rows={rows}
            className={textareaClasses}
            aria-invalid={Boolean(error)}
            {...props}
        />
    );
}
