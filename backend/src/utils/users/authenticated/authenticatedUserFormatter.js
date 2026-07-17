/* ==========================================================================
   Authenticated User Formatter

   Formats authenticated user responses.

   Responsibilities
   - Build authenticated user API responses

   Notes
   - Authenticated users can access their own email address.
=========================================================================== */

/* =============================
   AUTHENTICATED USER FORMATTING
============================= */

// Format an authenticated user API response
const formatAuthenticatedUser = (user) => ({
    userId: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null
});

module.exports = { formatAuthenticatedUser };
