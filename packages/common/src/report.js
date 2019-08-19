import {NO_FILEPATH} from './constants.js';
import {createDebugger} from './debug.js';
import {createRTkError, RTKERR_INVALID_REPORT} from './error.js';
import {kReport, kReportFilepath} from './symbols.js';
import {_} from './util.js';

const debug = createDebugger('common', 'report');

const KNOWN_PROPS = [
  'header',
  'javascriptStack',
  'nativeStack',
  'javascriptHeap',
  'resourceUsage',
  'libuv',
  'environmentVariables',
  'userLimits',
  'sharedObjects'
];

/**
 * Represents a Diagnostic Report
 * @todo Need to add type defs or a schema or something
 */
export class Report {
  /**
   * @param {ReportLike} report
   */
  constructor(report, filepath = NO_FILEPATH) {
    if (!Report.isReportLike(report)) {
      throw createRTkError(RTKERR_INVALID_REPORT, `Invalid report!`);
    }
    Object.assign(this, _.pick(KNOWN_PROPS, report));
    this[kReportFilepath] = filepath;
    this[kReport] = true;
    debug(
      // @ts-ignore
      `created Report generated on ${this.header.dumpEventTime} w/ filepath ${this[kReportFilepath]}`
    );
  }

  get filepath() {
    return this[kReportFilepath];
  }

  /**
   * @param {ReportLike} rawReport
   * @param {string} filepath
   */
  static create(rawReport, filepath) {
    return Object.freeze(new Report(rawReport, filepath));
  }

  /**
   * @param {any} value
   */
  static isReport(value) {
    return _.isObject(value) && _.has(kReportFilepath, value);
  }

  /**
   * @param {object} value
   */
  static isReportLike(value) {
    return _.isObject(value) && _.every(key => _.has(key, value), KNOWN_PROPS);
  }
}

export const createReport = Report.create;
export const isReport = Report.isReport;

export const isReportLike = _.memoize(Report.isReportLike);

/**
 * @typedef {import('packages/core/src/stream.js').ReportLike} ReportLike
 */
