/* ==================================================
   VALIDATION TEST HELPERS

   Handles:
   - express-validator execution in tests
   - mocked request body validation
   - mocked request params validation
   - mocked request query validation

   Notes:
   - shared across validator unit tests
   - supports body, params, and query validation testing
================================================== */

const { validationResult } = require("express-validator");

// Run express-validator rules against mocked request data
const runValidation = async (validators, {
    params = {},
    body = {},
    query = {}
} = {}) => {

    const req = { params, body, query };

    for (const validator of validators) {
        await validator.run(req);
    }

    return validationResult(req);
};

module.exports = { runValidation };
