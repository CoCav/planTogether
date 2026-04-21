export const validateEventForm = ({ title, type, theme, description, startDate, startTime, endDate, endTime, mode, location }, options = {} ) => {
    const { allowPastStart = false } = options;
    const errors = {};

    if (!title?.trim()) {
        errors.title = "Title is required";
    }

    if (!type?.trim()) {
        errors.type = "Type is required";
    }

    if (!theme?.trim()) {
        errors.theme = "Theme is required";
    }

    if (!description?.trim()) {
        errors.description = "Description is required";
    }

    if (!startDate) {
        errors.startDate = "Start date is required";
    }

    if (!startTime) {
        errors.startTime = "Start time is required";
    }

    if (!endDate) {
        errors.endDate = "End date is required";
    }

    if (!endTime) {
        errors.endTime = "End time is required";
    }

    /* ---------- Start date/time validation ---------- */
    if (!allowPastStart && startDate && startTime) {
        const now = new Date();
        const start = new Date(`${startDate}T${startTime}`);

        // Get today's date in YYYY-MM-DD format for comparison
        const today = new Date().toISOString().split("T")[0];

        // Case 1: Start date is before today
        if (startDate < today) {
            errors.startDate = "Start date cannot be in the past";
        }
        // Case 2: Same day but time is in the past
        else if (startDate === today && start < now) {
            errors.startTime = "Start time cannot be in the past";
        }
    }

    /* ---------- End date/time validation ---------- */
    if (startDate && startTime && endDate && endTime) {
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);

        // Case 1: End date is before start date
        if (endDate < startDate) {
            errors.endDate = "End date must be after start date";
        }
        // Case 2: Same day but end time is before or equal to start time
        else if (startDate === endDate && end <= start) {
            errors.endTime = "End time must be after start time";
        }
    }

    if (mode === "in_person" && !location?.trim()) {
        errors.location = "Location is required for in-person events";
    }

    return errors;
};