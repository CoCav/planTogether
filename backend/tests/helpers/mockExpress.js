/* ==================================================
   MOCK EXPRESS HELPERS

   Handles:
   - Express request mocking
   - Express response mocking
   - next() function mocking

   Notes:
   - shared across unit controller and middleware tests
   - reduces duplicated mock setup in tests
================================================== */

// Create mocked Express req / res / next objects
const createMockReqResNext = ({ params = {}, query = {}, body = {}, user = undefined, file = undefined } = {}) => {

    // Mock Express request object
    const req = { params, query, body, user, file };

    // Mock Express response object
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    // Mock Express next function
    const next = jest.fn();

    return { req, res, next };
};

module.exports = { createMockReqResNext };
