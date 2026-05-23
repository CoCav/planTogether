/* ==================================================
   MY PROFILE PAYLOAD BUILDER
   Builds authenticated user profile update payloads

   Handles:
   - profile payload normalization
   - profile FormData creation
   - avatar file inclusion
   - avatar removal payload

   Notes:
   - used by current user profile update flow
   - backend clears avatar when avatar is provided as an empty value
================================================== */

/* =============================
   PROFILE PAYLOAD
============================= */

// Builds a normalized profile payload from form values
export const buildCurrentUserProfilePayload = (values = {}) => ({
    name: values.name,
    email: values.email,

    avatar:
        values.avatar ||
        (values.currentAvatar === null ? "" : undefined)
});

/* =============================
   FORM DATA PAYLOAD
============================= */

// Builds FormData for current user profile update
export const buildCurrentUserProfileFormData = (values = {}) => {
    const payload = buildCurrentUserProfilePayload(values);
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined) return;

        formData.append(key, value);
    });

    return formData;
};
