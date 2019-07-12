export const ERROR = 'error';
export const WARNING = 'warning';
export const INFO = 'info';
export const NAMESPACE = 'gnostic';

export const DEFAULT_DIFF_OPTIONS = Object.freeze({
  properties: Object.freeze([
    'environmentVariables',
    'header',
    'userLimits',
    'sharedObjects'
  ]),
  showSecretsUnsafe: false
});

export const DEFAULT_LOAD_REPORT_OPTIONS = Object.freeze({
  disableSort: false,
  severity: ERROR,
  showSecretsUnsafe: false,
  sortDirection: 'asc',
  sortField: 'header.dumpEventTimestamp'
});

export const REDACTED_TOKEN = '[REDACTED]';
