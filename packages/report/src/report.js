import {_} from '@gnostic/common';
import {kReport, kReportFilepath} from '@gnostic/common/src/symbols.js';

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
  constructor(report, filepath = '(no filepath)') {
    Object.assign(this, _.pick(KNOWN_PROPS, report));
    this[kReportFilepath] = filepath;
    this[kReport] = true;
  }

  get filepath() {
    return this[kReportFilepath];
  }

  static create(report, filepath) {
    return report[kReport]
      ? report
      : Object.freeze(new Report(report, filepath));
  }

  static isReport(value) {
    return _.isObject(value) && Boolean(value[kReportFilepath]);
  }
}

export const createReport = Report.create;
export const createReportWithFilepath = _.curry((filepath, report) =>
  createReport(report, filepath)
);
export const isReport = Report.isReport;
