import {
  _,
  createDebugPipe,
  error,
  isReport,
  observable
} from '@report-toolkit/common';
import {diffReports} from '@report-toolkit/diff';
import {createRule, toReportFromObject} from '@report-toolkit/inspector';

const {createRTkError, RTKERR_INVALID_PARAMETER} = error;
const {
  defer,
  filter,
  map,
  mergeMap,
  of,
  pipeIf,
  take,
  tap,
  toArray,
  toObjectFromJSON
} = observable;

const debug = createDebugPipe('core', 'internal');

/**
 *
 * @param {string|object} value - Report as JSON string or parsed report
 * @param {*} [opts]
 */
const reportFrom = (value, opts = {}) =>
  defer(() =>
    (_.isString(value) ? reportFromJSON : reportFromObject)(value, opts)
  );
/**
 *
 * @param {string} json - Report as JSON string
 * @param {*} [opts]
 */
const reportFromJSON = (json, opts = {}) =>
  of(json).pipe(
    toObjectFromJSON(),
    toReportFromObject(opts)
  );

/**
 *
 * @param {object} obj - Raw parsed report object
 * @param {*} [opts]
 */
const reportFromObject = (obj, opts = {}) =>
  of(obj).pipe(toReportFromObject(opts));

/**
 *
 * @param {object} [opts]
 * @returns {OperatorFunction<string|object,Report>}
 */
export const toReport = (opts = {}) => observable =>
  observable.pipe(
    pipeIf(
      value => !isReport(value),
      mergeMap(value => reportFrom(value, opts))
    )
  );

/**
 *
 * @param {object} [config] - Raw rule configuration
 * @returns {OperatorFunction<RuleDefinition,RuleConfig>}
 */
export const toRuleConfig = (config = {}) => {
  const ruleIdsCount = _.getOr(0, 'rules.length', config);
  return ruleDefs =>
    ruleDefs.pipe(
      pipeIf(!ruleIdsCount, debug(() => 'whitelisting rules by default')),
      pipeIf(ruleIdsCount, filter(({id}) => Boolean(_.get(id, config.rules)))),
      map(ruleDefinition => createRule(ruleDefinition).toRuleConfig(config))
    );
};
/**
 *
 * @param {object} [opts]
 * @returns {OperatorFunction<Report[],object>}
 */
export const toReportDiff = (opts = {}) => reports =>
  reports.pipe(
    take(2),
    pipeIf(
      /** @param {any} value */
      value => !isReport(value),
      mergeMap(report => reportFrom(report, opts))
    ),
    toArray(),
    tap(reports => {
      if (reports.length < 2) {
        throw createRTkError(
          RTKERR_INVALID_PARAMETER,
          'Two reports are required!'
        );
      }
    }),
    diffReports(opts)
  );

/**
 * @typedef {import('@report-toolkit/common').Report} Report
 * @typedef {import('@report-toolkit/inspector/src/rule').RuleDefinition} RuleDefinition
 * @typedef {import('@report-toolkit/inspector').RuleConfig} RuleConfig
 */
/**
 * @template T,U
 * @typedef {import('rxjs').OperatorFunction<T,U>} OperatorFunction
 */
