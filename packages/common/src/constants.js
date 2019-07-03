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
  showSecretsUnsafe: false,
  sortField: 'header.dumpEventTimestamp',
  sortDirection: 'asc',
  disableSort: false,
  severity: ERROR
});

export const REDACTED_TOKEN = '[REDACTED]';
