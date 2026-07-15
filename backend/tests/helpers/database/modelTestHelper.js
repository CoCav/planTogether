/* ==========================================================================
   Model Test Helper

   Builds reusable database model mocks.

   Responsibilities
   - Create reusable scoped model mocks
   - Create reusable transaction mocks
   - Provide common mocked model methods

   Notes
   - Shared across service unit tests.
   - Add new mocked methods only when they become reusable.
=========================================================================== */

/* =============================
   MODEL MOCKS
============================= */

const createScopedModelMock = () => ({
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
});

/* =============================
   TRANSACTION MOCKS
============================= */

const createTransactionMock = () => ({
    commit: jest.fn(),
    rollback: jest.fn()
});

module.exports = {
    createScopedModelMock,
    createTransactionMock
};
