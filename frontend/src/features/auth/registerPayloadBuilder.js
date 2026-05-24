/* ==================================================
   REGISTER FORM DATA BUILDER
   Builds multipart FormData for user registration

   Handles:
   - register form data creation
   - optional avatar upload payload
================================================== */

// Builds FormData payload for register requests
export const buildRegisterFormData = (values = {}) => {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);

    // Avatar upload is optional
    if (values.avatar) {
        formData.append("avatar", values.avatar);
    }

    return formData;
};
