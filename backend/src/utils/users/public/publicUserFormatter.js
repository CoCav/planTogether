/* ==========================================================================
   Public User Formatter

   Formats public user responses.

   Responsibilities
   - Build public user API responses

   Notes
   - Public responses never expose sensitive user information.
=========================================================================== */

// Format the public user response.
const formatPublicUser = (user) => ({
    name: user.name,
    avatar: user.avatar || null
});

module.exports = { formatPublicUser };
