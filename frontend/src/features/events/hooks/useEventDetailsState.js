import { useState } from "react";

/* ==================================================
   USE EVENT DETAILS STATE
   Handles event details page UI state

   Handles:
   - feedback messages
   - loading state
================================================== */

export default function useEventDetailsState() {

    /* =============================
       FEEDBACK STATE
    ============================= */

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    /* =============================
       LOADING STATE
    ============================= */

    const [loading, setLoading] = useState(true);

    return {
        feedback: {
            message,
            setMessage,
            error,
            setError
        },

        loadingState: {
            loading,
            setLoading
        }
    };
}
