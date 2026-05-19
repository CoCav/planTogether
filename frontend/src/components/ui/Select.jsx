/* ==================================================
   SELECT
   Reusable styled select with custom dropdown icon

   Handles:
   - base select styling
   - error state
   - custom dropdown icon
================================================== */

export default function Select({ className = "", error = false, children, ...props }) {

    /* =========================
       CSS CLASSES
    ========================= */

    const wrapperClasses = `select-wrapper ${error ? "error" : ""} ${className}`.trim();
    const selectClasses = `select ${error ? "error" : ""}`.trim();

    return (
        <div className={wrapperClasses}>
            <select
                className={selectClasses}
                {...props}
            >
                {children}
            </select>

            <span className="select-icon" aria-hidden="true">
                ▾
            </span>
        </div>
    );
}
