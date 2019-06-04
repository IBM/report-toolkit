import {Context} from './context';
import _ from 'lodash/fp';
export const kReportFilepath = Symbol('reportFilepath');
export const kReportQueue = Symbol('reportQueue');

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

const assignKnownProps = _.curry((source, dest) => {
  _.forEach(prop => {
    dest[prop] = source[prop];
  }, KNOWN_PROPS);
});

export class Report {
  constructor(report, filepath) {
    assignKnownProps(report, this);

    this[kReportFilepath] = filepath;
  }

  get filepath() {
    return this[kReportFilepath];
  }

  createContext(ruleConfig) {
    return Context.create(this, ruleConfig);
  }

  static create(report, filepath) {
    return Object.freeze(new Report(report, filepath));
  }
}

Report.createFromFile = _.curry((filepath, report) =>
  Report.create(report, filepath)
);
