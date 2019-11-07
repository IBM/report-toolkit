import {NO_FILEPATH, REPORT_KNOWN_ROOT_PROPERTIES} from './constants.js';
import {createDebugger} from './debug.js';
import {createRTkError, RTKERR_INVALID_REPORT} from './error.js';
import {kReport, kReportFilepath} from './symbols.js';
import {_} from './util.js';

const debug = createDebugger('common', 'report');

/**
 * Represents a [Diagnostic Report](https://nodejs.org/api/process.html#process_process_report_getreport_err).
 */
class Report {
  /**
   * Creates shallow copies of root props in `report`; assigns internally-used `Symbol`s.
   * @param {import('../diagnostic-report').DiagnosticReport} report - Raw object
   * @param {string?} filepath - Original filepath of report, if available. Defaults to {@link NO_FILEPATH}
   */
  constructor(report, filepath = NO_FILEPATH) {
    if (!Report.isReportLike(report)) {
      throw createRTkError(RTKERR_INVALID_REPORT, `Invalid report!`);
    }

    this.header = {...report.header};
    this.javascriptStack = {...report.javascriptStack};
    this.nativeStack = [...report.nativeStack];
    this.javascriptHeap = {...report.javascriptHeap};
    this.resourceUsage = {...report.resourceUsage};
    this.libuv = [...report.libuv];
    this.environmentVariables = {...report.environmentVariables};
    this.userLimits = {...report.userLimits};
    this.sharedObjects = [...report.sharedObjects];

    this[kReportFilepath] = filepath;
    this[kReport] = true;

    debug(
      `created Report generated on ${this.header.dumpEventTime} w/ filepath ${this[kReportFilepath]}`
    );
  }

  /**
   * Original filepath of report, if available. Defaults to {@link NO_FILEPATH}.
   */
  get filepath() {
    return /** @type {string} */ (this[kReportFilepath]);
  }

  /**
   * Creates a read-only {@link Report} from a {@link ReportLike} value.
   * Use this instead of `new Report()`!
   * @param {ReportLike} rawReport
   * @param {string} filepath
   */
  static create(rawReport, filepath) {
    return Object.freeze(new Report(rawReport, filepath));
  }

  /**
   * Returns `true` if the value is an object having a property `report-toolkit-report` `Symbol` with value `true`.
   * @param {any} value
   */
  static isReport(value) {
    return _.isObject(value) && value[kReport] === true;
  }

  /**
   * Returns `true` if `value` has all expected root properties of a Diagnostic Report (as returned by [process.report.getReport()](https://nodejs.org/api/process.html#process_process_report_getreport_err)), or is a {@link Report}.
   * @param {any} value
   */
  static isReportLike(value) {
    return (
      Report.isReport(value) ||
      (_.isObject(value) &&
        _.every(key => {
          const hasValue = _.has(key, value);
          if (!hasValue) {
            debug(`report is missing prop "${key}"`);
          }
          return hasValue;
        }, REPORT_KNOWN_ROOT_PROPERTIES))
    );
  }
}

export const createReport = Report.create;
export const isReport = Report.isReport;
export const isReportLike = Report.isReportLike;

export {Report};

/**
 * Either a {@link Report} or an object with all of the required props.  See {@link Report.isReportLike}
 * @typedef {import('../diagnostic-report').DiagnosticReport|Report} ReportLike
 */
