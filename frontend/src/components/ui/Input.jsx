/* ==================================================
   INPUT
   Reusable styled input field for forms

   Handles:
   - base input styling
   - error styling
   - accessible invalid state
   - native input attributes
================================================== */

export default function Input({ className = "", error = false, ...props }) {

    /* =========================
       CSS CLASSES
    ========================= */

    const inputClasses = `
        input
        ${error ? "error" : ""}
        ${className}
    `.trim();

    return (
        <input
            className={inputClasses}
            aria-invalid={Boolean(error)}
            {...props}
        />
    );
}
