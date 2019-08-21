export const ERROR = 'error';
export const WARNING = 'warning';
export const INFO = 'info';

/**
 * Project namespace
 */
export const NAMESPACE = 'report-toolkit';

/**
 * Short project namespace
 */
export const SHORT_NAMESPACE = 'rtk';

/**
 * Text to use in display if no filepath found
 */
export const NO_FILEPATH = '(no filepath)';
export const MULTIPLE_FILEPATHS = '(multiple files)';
export const DEFAULT_TRANSFORMER = 'table';

/**
 * @type {InspectReportOptions}
 */
export const DEFAULT_LOAD_REPORT_OPTIONS = Object.freeze({
  disableSort: false,
  severity: ERROR,
  showSecretsUnsafe: false,
  sortDirection: 'asc',
  sortField: 'header.dumpEventTimestamp'
});

export const REDACTED_TOKEN = '[REDACTED]';

export const DEFAULT_TERMINAL_WIDTH = 80;

/**
 * @typedef {{disableSort?: boolean, severity?: string, showSecretsUnsafe?: boolean, sortDirection?: "asc"|"desc", sortField?: string}} InspectReportOptions
 */
