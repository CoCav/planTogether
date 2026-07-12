const { validationResult } = require("express-validator");

/* ==========================================================================
   Validation Test Helper

   Builds reusable validation helpers for validator tests.

   Responsibilities
   - Build mock validation requests
   - Execute express-validator chains
   - Return validation results
   - Expose sanitized request values

   Notes
   - Shared across validator unit tests.
   - Supports request params, body and query validation.
=========================================================================== */

const createValidationRequest = ({
    params = {},
    body = {},
    query = {}
} = {}) => ({
    params: { ...params },
    body: { ...body },
    query: { ...query }
});

const runValidation = async (
    validators,
    requestData = {}
) => {
    const req = createValidationRequest(requestData);

    for (const validator of validators) {
        await validator.run(req);
    }

    const result = validationResult(req);

    return {
        req,
        result,
        errors: result.array()
    };
};

const getValidationMessages = (errors = []) => {
    return errors.map((error) => error.msg);
};

module.exports = {
    createValidationRequest,
    runValidation,
    getValidationMessages
};
