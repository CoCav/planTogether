import { ChevronDown } from "lucide-react";

/* ==================================================
   SELECT
   Reusable styled select with custom dropdown icon

   Handles:
   - base select styling
   - wrapper class styling
   - error state
   - accessible invalid state
   - native select props forwarding
   - decorative dropdown icon
================================================== */

export default function Select({ className = "", error = false, children, ...props }) {

    /* =========================
       CSS CLASSES
    ========================= */

    const wrapperClasses = [
        "select-wrapper",
        error && "error",
        className
    ]
        .filter(Boolean)
        .join(" ");

    const selectClasses = [
        "select",
        error && "error"
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={wrapperClasses}>
            <select
                className={selectClasses}
                aria-invalid={Boolean(error)}
                {...props}
            >
                {children}
            </select>

            <span className="select-icon" aria-hidden="true">
                <ChevronDown />
            </span>
        </div>
    );
}
