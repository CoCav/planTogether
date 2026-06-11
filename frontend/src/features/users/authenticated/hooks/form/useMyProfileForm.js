import { useEffect, useState } from "react";

import { getApiErrorMessage } from "../../../../../api/apiError";
import { updateCurrentUserProfile } from "../../../../../api/users/userApi";

import { validateProfileForm } from "../../../userValidation";
import { buildCurrentUserProfileFormData } from "../../myProfilePayloadBuilder";

/* ==================================================
   USE MY PROFILE FORM
   Manages authenticated user profile form state

   Handles:
   - current user profile form values
   - avatar update and removal
   - field validation errors
   - submit loading state
   - profile update submission
   - user refresh after successful update
================================================== */

export default function useMyProfileForm({
    user,
    refreshUser,
    setMessage,
    setError
}) {

    /* =============================
       FORM STATE
    ============================= */

    const [values, setValues] = useState({
        name: user?.name ?? "",
        email: user?.email ?? "",
        avatar: null,
        currentAvatar: null
    });

    const [fieldErrors, setFieldErrors] = useState({});

    /* =============================
       SUBMIT STATE
    ============================= */

    const [isSubmitting, setIsSubmitting] = useState(false);

    /* =============================
       PROFILE SYNC
    ============================= */

    // Syncs editable profile values when user data changes
    useEffect(() => {
        if (!user) return;

        setValues({
            name: user.name ?? "",
            email: user.email ?? "",
            avatar: null,
            currentAvatar: user.avatar || null
        });
    }, [user]);

    /* =============================
       FIELD HANDLERS
    ============================= */

    // Updates editable profile fields
    const handleFieldChange = (event) => {
        const { name, value } = event.target;

        setValues((prev) => ({
            ...prev,
            [name]: value
        }));

        // Clears field error while user edits the field
        setFieldErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    /* =============================
       AVATAR HANDLERS
    ============================= */

    // Updates selected avatar file
    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0] || null;

        setValues((prev) => ({
            ...prev,
            avatar: file
        }));

        // Clear avatar validation error after avatar update
        setFieldErrors((prev) => ({
            ...prev,
            avatar: undefined
        }));
    };

    // Removes avatar preview and selected file
    const handleRemoveAvatar = () => {
        setValues((prev) => ({
            ...prev,
            avatar: null,
            currentAvatar: null
        }));

        // Clear avatar validation error after avatar update
        setFieldErrors((prev) => ({
            ...prev,
            avatar: undefined
        }));
    };

    /* =============================
       SUBMIT HANDLER
    ============================= */

    // Validates and updates authenticated user profile
    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const validationErrors = validateProfileForm(values);

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            await updateCurrentUserProfile(
                buildCurrentUserProfileFormData(values)
            );

            await refreshUser();

            setMessage("Profile updated successfully");

        } catch (error) {
            console.error("Error updating profile:", error);

            setError(
                getApiErrorMessage(error, "Unable to update profile")
            );

        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formState: {
            values,
            setValues,
            fieldErrors,
            setFieldErrors
        },

        submitState: {
            isSubmitting
        },

        formActions: {
            handleFieldChange,
            handleAvatarChange,
            handleRemoveAvatar,
            handleSubmit
        }
    };
}
