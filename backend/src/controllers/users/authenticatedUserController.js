const userService = require("../../services/userService");

const AVATAR_UPLOAD_PATH = "/uploads/avatars";

const { formatAuthenticatedUser } = require("../../utils/users/authenticated/authenticatedUserFormatter");

/* ==========================================================================
   Authenticated User Controller

   Handles authenticated user responses.

   Responsibilities
   - Retrieve current user events
   - Retrieve current user profile
   - Update current user profile
   - Change current user password
   - Delete current user account

   Notes
   - Current user routes use req.user.userId.
   - Business logic is delegated to userService.
   - Authenticated user responses can expose email.
=========================================================================== */

/* Current user events */

const getCurrentUserEvents = async (req, res, next) => {
    try {
        const result = await userService.getCurrentUserEventsById(
            req.user.userId,
            req.query
        );

        return res.status(200).json({
            success: true,
            message: "User events retrieved successfully",
            ...result
        });

    } catch (error) {
        return next(error);
    }
};

/* Current user profile */

const getCurrentUserProfile = async (req, res, next) => {
    try {
        const user = await userService.getCurrentUserProfileById(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            user: formatAuthenticatedUser(user)
        });

    } catch (error) {
        return next(error);
    }
};

const updateCurrentUserProfile = async (req, res, next) => {
    try {
        const updatedData = {
            ...req.body
        };

        if (req.file) {
            updatedData.avatar = `${UPLOAD_PATHS.AVATARS}/${req.file.filename}`;
        }

        const user = await userService.updateCurrentUserProfileById(
            req.user.userId,
            updatedData
        );

        return res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            user: formatAuthenticatedUser(user)
        });

    } catch (error) {
        return next(error);
    }
};

/* Current user password */

const changeCurrentUserPassword = async (req, res, next) => {
    try {
        await userService.changeCurrentUserPasswordById(
            req.user.userId,
            req.body.currentPassword,
            req.body.newPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        return next(error);
    }
};

/* Current user account */

const deleteCurrentUser = async (req, res, next) => {
    try {
        await userService.deleteCurrentUserById(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getCurrentUserEvents,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    changeCurrentUserPassword,
    deleteCurrentUser
};
