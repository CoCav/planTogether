/* ==================================================
   MOCK EXPRESS HELPERS

   Handles:
   - Express request mocking
   - Express response mocking
   - next() function mocking

   Notes:
   - shared across unit controller and middleware tests
   - keep this helper generic and add local wrappers when tests need defaults
================================================== */

// Create mocked Express req / res / next objects
const createMockReqResNext = ({ params = {}, query = {}, body = {}, user = undefined, file = undefined } = {}) => {
    const req = { params, query, body, user, file };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

module.exports = { createMockReqResNext };
