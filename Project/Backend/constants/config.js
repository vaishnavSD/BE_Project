// Application constants and configuration

// Date validation
export const MAX_PICKUP_DAYS_AHEAD = 30;

// Password requirements
export const PASSWORD_MIN_LENGTH = 8;

// Collection ID generation
export const COLLECTION_ID_PREFIX = 'COLL';
export const COLLECTION_ID_RANDOM_MIN = 100;
export const COLLECTION_ID_RANDOM_MAX = 999;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  FACTORY: 'factory',
  CALL_AGENT: 'call_agent'
};

// Request statuses
export const REQUEST_STATUS = {
  PENDING: 'Pending',
  CALL_AGENT_APPROVED: 'Call Agent Approved',
  ACCEPTED_BY_AGENT: 'Accepted by Agent',
  COLLECTED: 'Collected'
};

// Collection approval statuses
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  COLLECTED: 'collected'
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Bcrypt rounds
export const BCRYPT_ROUNDS = 12;
