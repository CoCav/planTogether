import { useState } from "react";

/* ==================================================
   USE EVENT DETAILS STATE
   Handles event details page UI state

   Handles:
   - inline error feedback
   - loading state
================================================== */

export default function useEventDetailsState() {

    /* =============================
       FEEDBACK STATE
    ============================= */

    const [error, setError] = useState("");

    /* =============================
       LOADING STATE
    ============================= */

    const [loading, setLoading] = useState(true);

    return {
        feedback: {
            error,
            setError
        },

        loadingState: {
            loading,
            setLoading
        }
    };
}
