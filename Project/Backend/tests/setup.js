// Jest setup file for database mocking and global test configuration

// Mock database connection
global.mockDb = {
  query: jest.fn(),
  execute: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  end: jest.fn()
};

// Mock request object
global.mockReq = (overrides = {}) => ({
  db: global.mockDb,
  body: {},
  params: {},
  query: {},
  headers: {},
  ip: '127.0.0.1',
  ...overrides
});

// Mock response object
global.mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(10000);
