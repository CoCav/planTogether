/* ==================================================
   USER FORMATTER UTILITIES

   Handles:
   - authenticated user response formatting
   - public user response formatting
   - safe API payload shaping

   Notes:
   - authenticated users can expose email
   - public users never expose sensitive fields
   - centralizes reusable user response formatting
================================================== */

// Format authenticated user responses
const formatAuthenticatedUser = (user) => ({
    userId: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null
});

// Format public user responses
const formatPublicUser = (user) => ({
    name: user.name,
    avatar: user.avatar || null
});

module.exports = { formatAuthenticatedUser, formatPublicUser };
