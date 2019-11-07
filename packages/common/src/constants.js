/**
 * Known root properties of a Diagnostic Report.  To be processed, an object must have *all* of these properties.  The current list _in order_:
 * - `header`
 * - `javascriptStack`
 * - `nativeStack`
 * - `javascriptHeap`
 * - `resourceUsage`
 * - `libuv`
 * - `environmentVariables`
 * - `userLimits`
 * - `sharedObjects`
 */
export const REPORT_KNOWN_ROOT_PROPERTIES = Object.freeze([
  'header',
  'javascriptStack',
  'nativeStack',
  'javascriptHeap',
  'resourceUsage',
  'libuv',
  'environmentVariables',
  'userLimits',
  'sharedObjects'
]);

/**
 * "Error" severity.  The highest severity, and the default.
 */
export const ERROR = 'error';

/**
 * "Warning" severity.
 */
export const WARNING = 'warning';

/**
 * "Info" severity. The lowest severity.
 */
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

/**
 * @hidden
 */
export const MULTIPLE_FILEPATHS = '(multiple files)';

/**
 * @hidden
 */
export const DEFAULT_TRANSFORMER = 'table';

/**
 * The string token used to replace secrets when redacting from a report.
 */
export const REDACTED_TOKEN = '[REDACTED]';

/**
 * @hidden
 */
export const DEFAULT_TERMINAL_WIDTH = 80;

/**
 * Potential severities of Messages reported by the inspector.
 * @enum {number}
 */
export const SEVERITIES = Object.freeze({
  [ERROR]: 30,
  [INFO]: 10,
  [WARNING]: 20
});

/**
 * Typically useless keypaths to explicitly omit from diffs. Anything here should be more specific than what's in {@link DEFAULT_DIFF_INCLUDE}.
 */
export const DEFAULT_DIFF_EXCLUDE = Object.freeze([
  'header.filename', // typically redundant
  'header.dumpEventTime', // always different
  'header.dumpEventTimeStamp', // ditto
  'header.cpus' // can vary wildly
]);

/**
 * Things we explicitly want to show in the diffs.  Use {@link DEFAULT_DIFF_EXCLUDE} to exclude any child properties of these.
 */
export const DEFAULT_DIFF_INCLUDE = Object.freeze([
  'header',
  'environmentVariables',
  'userLimits',
  'sharedObjects'
]);

/**
 * Default severity across system
 */
export const DEFAULT_SEVERITY = WARNING;
