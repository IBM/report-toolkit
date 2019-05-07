export const kReportFilepath = Symbol('reportFilepath');

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
  constructor(report, filepath) {
    KNOWN_PROPS.forEach(prop => {
      this[prop] = report[prop];
    });

    this[kReportFilepath] = filepath;
  }

  get filepath() {
    return this[kReportFilepath];
  }

  static create(report, filepath) {
    return Object.freeze(new Report(report, filepath));
  }
}
