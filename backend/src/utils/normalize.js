/* ==================================================
   NORMALIZATION UTILITIES

   Handles:
   - reusable string normalization
   - email normalization

   Notes:
   - keeps services consistent
   - avoids duplicated trim/lowercase logic
================================================== */

// Normalize email before persistence or lookup
const normalizeEmail = (email) => {
    return String(email).toLowerCase().trim();
};

module.exports = { normalizeEmail };
