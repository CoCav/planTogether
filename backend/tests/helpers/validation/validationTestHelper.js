const { validationResult } = require("express-validator");

/* ==========================================================================
   Validation Test Helper

   Builds reusable validation helpers for validator tests.

   Responsibilities
   - Execute express-validator chains
   - Build mock validation requests
   - Return validation results

   Notes
   - Shared across validator unit tests.
   - Supports request params, body and query validation.
=========================================================================== */

const runValidation = async (
    validators,
    {
        params = {},
        body = {},
        query = {}
    } = {}
) => {
    const req = {
        params,
        body,
        query
    };

    for (const validator of validators) {
        await validator.run(req);
    }

    return validationResult(req);
};

module.exports = {
    runValidation
};
