/* ==================================================
   EVENT VALIDATION
   Provides frontend validation for create/edit event forms

   Handles:
   - required event fields
   - start/end date logic
   - in-person location requirement
================================================== */

const getDateTime = (date, time) => new Date(`${date}T${time}`);

const getTodayInputDate = () => new Date().toISOString().split("T")[0];

export const validateEventForm = ({ title, type, theme, description, startDate, startTime, endDate, endTime, mode, location }, options = {}) => {
    const { allowPastStart = false } = options;
    const errors = {};

    if (!title?.trim()) errors.title = "Title is required";
    if (!type?.trim()) errors.type = "Type is required";
    if (!theme?.trim()) errors.theme = "Theme is required";
    if (!description?.trim()) errors.description = "Description is required";

    if (!startDate) errors.startDate = "Start date is required";
    if (!startTime) errors.startTime = "Start time is required";
    if (!endDate) errors.endDate = "End date is required";
    if (!endTime) errors.endTime = "End time is required";

    if (!allowPastStart && startDate && startTime) {
        const now = new Date();
        const start = getDateTime(startDate, startTime);
        const today = getTodayInputDate();

        if (startDate < today) {
            errors.startDate = "Start date cannot be in the past";
        } else if (startDate === today && start < now) {
            errors.startTime = "Start time cannot be in the past";
        }
    }

    if (startDate && startTime && endDate && endTime) {
        const start = getDateTime(startDate, startTime);
        const end = getDateTime(endDate, endTime);

        if (endDate < startDate) {
            errors.endDate = "End date must be after start date";
        } else if (startDate === endDate && end <= start) {
            errors.endTime = "End time must be after start time";
        }
    }

    if (mode === "in_person" && !location?.trim()) {
        errors.location = "Location is required for in-person events";
    }

    return errors;
};
