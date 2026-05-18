import { useEffect } from "react";

/* ==================================================
   USE CLICK OUTSIDE
   Runs a callback when the user clicks outside
   a referenced element

   Handles:
   - outside click detection
   - document listener cleanup
   - conditional listener activation
================================================== */

export function useClickOutside(ref, callback, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback, enabled]);
}
