/**
 * Status Values & System Health Constants
 */

export const STATUS_TYPES = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BLOCKED: 'BLOCKED',
  SUSPENDED: 'SUSPENDED',
  PROCESSED: 'PROCESSED',
  COMPLETED: 'COMPLETED',
});

export const SYSTEM_STATUS = Object.freeze({
  OPERATIONAL: 'Operational',
  HEALTHY: 'Healthy',
  DEGRADED: 'Degraded',
  DOWN: 'Down',
});

export const STATUS_LABELS = Object.freeze({
  [STATUS_TYPES.ACTIVE]: 'Active',
  [STATUS_TYPES.INACTIVE]: 'Inactive',
  [STATUS_TYPES.PENDING]: 'Pending Review',
  [STATUS_TYPES.APPROVED]: 'Approved',
  [STATUS_TYPES.REJECTED]: 'Rejected',
  [STATUS_TYPES.BLOCKED]: 'Blocked',
});

export default {
  STATUS_TYPES,
  SYSTEM_STATUS,
  STATUS_LABELS,
};
