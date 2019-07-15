import {_, constants, createDebugger, symbols} from '@report-toolkit/common';

const {kReport, kReportFilepath} = symbols;
const {NO_FILEPATH} = constants;
const debug = createDebugger('report');

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

export class Report {
  constructor(report, filepath = NO_FILEPATH) {
    Object.assign(this, _.pick(KNOWN_PROPS, report));
    this[kReportFilepath] = filepath;
    this[kReport] = true;
    debug(
      `created Report generated on ${this.header.dumpEventTime} w/ filepath ${this[kReportFilepath]}`
    );
  }

  get filepath() {
    return this[kReportFilepath];
  }

  static create(rawReport, filepath) {
    return Object.freeze(new Report(rawReport, filepath));
  }

  static isReport(value) {
    return _.isObject(value) && _.has(kReportFilepath, value);
  }
}

export const createReport = Report.create;
export const isReport = Report.isReport;
