/* ==================================================
   INPUT
   Reusable styled input field for forms

   Handles:
   - base input styling
   - error class styling
   - accessible invalid state
   - custom class merging
   - native input props forwarding
================================================== */

export default function Input({ className = "", error = false, ...props }) {

    /* =========================
       CSS CLASSES
    ========================= */

    const inputClasses = [
        "input",
        error && "error",
        className
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <input
            className={inputClasses}
            aria-invalid={Boolean(error)}
            {...props}
        />
    );
}
