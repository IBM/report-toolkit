import * as gnosticOperators from './operators';
import * as operators from 'rxjs/operators';
import * as rxjs from 'rxjs';

import _ from 'lodash/fp';

export const kReportFilepath = Symbol('reportFilepath');
export const kReportQueue = Symbol('reportQueue');

const issueQueueMap = new WeakMap();

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

const Util = Object.freeze({
  ...operators,
  ...rxjs,
  ...gnosticOperators
});

class ReportContext {
  report(message, data) {
    const queue = issueQueueMap.get(this);
    issueQueueMap.set(this, [...queue, {message, data}]);
    return this;
  }

  get util() {
    return Util;
  }

  flush() {
    const queue = [...issueQueueMap.get(this)];
    issueQueueMap.set(this, []);
    return this.util.from(queue);
  }
}

export class Report {
  constructor(report, filepath) {
    assignKnownProps(report, this);

    this[kReportFilepath] = filepath;
  }

  get filepath() {
    return this[kReportFilepath];
  }

  createContext() {
    const context = new ReportContext(this);
    const proxy = new Proxy(context, {
      get: (target, prop) => {
        if (_.hasIn(prop, target)) {
          return Reflect.get(target, prop);
        }
        return Reflect.get(this, prop);
      }
    });
    issueQueueMap.set(proxy, []);
    return proxy;
  }

  static create(report, filepath) {
    return new Report(report, filepath);
  }
}

Report.createFromFile = _.curry((filepath, report) =>
  Object.freeze(Report.create(report, filepath))
);
