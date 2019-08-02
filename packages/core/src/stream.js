import {
  _,
  constants,
  createDebugPipe,
  createReport,
  error,
  isReport,
  observable,
  redact
} from '@report-toolkit/common';
import {diffReports} from '@report-toolkit/diff';
import {
  createRule,
  createRuleConfig,
  inspectReports
} from '@report-toolkit/inspector';
import {loadTransforms, runTransforms} from '@report-toolkit/transformers';

const {DEFAULT_DIFF_OPTIONS, DEFAULT_LOAD_REPORT_OPTIONS} = constants;

const {RTKERR_INVALID_PARAMETER} = error;
const {
  defer,
  filter,
  fromAny,
  isObservable,
  map,
  mergeMap,
  of,
  pipeIf,
  sort,
  switchMapTo,
  take,
  throwRTkError,
  toArray,
  toObjectFromJSON
} = observable;

const debug = createDebugPipe('core', 'stream');

export const toReportDiff = (opts = {}) => {
  const {properties, showSecretsUnsafe} = _.defaults(
    DEFAULT_DIFF_OPTIONS,
    opts
  );
  return reports =>
    reports.pipe(
      take(2),
      pipeIf(
        value => !isReport(value),
        mergeMap(report => reportFrom(report, {showSecretsUnsafe}))
      ),
      toArray(),
      diffReports({properties})
    );
};

export const diff = (reports, opts = {}) => {
  const {properties, showSecretsUnsafe} = _.defaults(
    DEFAULT_DIFF_OPTIONS,
    opts
  );
  return fromAny(reports).pipe(
    take(2),
    toReport({showSecretsUnsafe}),
    toArray(),
    toReportDiff({properties, showSecretsUnsafe})
  );
};

export const toInspection = (reports, opts = DEFAULT_LOAD_REPORT_OPTIONS) => {
  const {severity} = opts;

  return isObservable(reports)
    ? ruleConfigs => ruleConfigs.pipe(inspectReports(reports, {severity}))
    : ruleConfigs =>
        ruleConfigs.pipe(
          switchMapTo(
            throwRTkError(
              RTKERR_INVALID_PARAMETER,
              'Parameter to toInspection() must be of type Observable<Report>'
            )
          )
        );
};

export const inspect = (reports, rules, config, {severity} = {}) =>
  fromAny(rules).pipe(
    map(createRuleConfig(config)),
    toInspection(fromAny(reports).pipe(toReport), {severity})
  );

export const toReportFromObject = (opts = {}) => {
  const {disableSort, showSecretsUnsafe, sortDirection, sortField} = _.defaults(
    DEFAULT_LOAD_REPORT_OPTIONS,
    opts
  );
  return observable =>
    observable.pipe(
      pipeIf(
        !showSecretsUnsafe,
        map(obj =>
          obj.rawReport
            ? {...obj, rawReport: redact(obj.rawReport)}
            : {rawReport: redact(obj)}
        )
      ),
      pipeIf(!disableSort, sort(`rawReport.${sortField}`, sortDirection)),
      map(({filepath, rawReport}) => createReport(rawReport, filepath))
    );
};

export const reportFrom = (value, opts = {}) =>
  defer(() =>
    (_.isString(value) ? reportFromJSON : reportFromObject)(value, opts)
  );

export const reportFromJSON = (json, opts = {}) =>
  of(json).pipe(
    toObjectFromJSON(),
    toReportFromObject(opts)
  );

export const reportFromObject = (obj, opts = {}) =>
  of(obj).pipe(toReportFromObject(opts));

export const toReport = (opts = {}) => observable =>
  observable.pipe(mergeMap(value => reportFrom(value, opts)));

export const toRuleConfig = (config = {}) => {
  const ruleIdsCount = _.getOr(0, 'rules.length', config);
  return ruleDefs =>
    ruleDefs.pipe(
      pipeIf(!ruleIdsCount, debug(() => 'whitelisting rules by default')),
      pipeIf(ruleIdsCount, filter(({id}) => Boolean(_.get(id, config.rules)))),
      map(({filepath, id, ruleDef}) =>
        createRule(ruleDef, {filepath, id}).toRuleConfig(config)
      )
    );
};

export {createRule};
export {parseConfig} from '@report-toolkit/config';

/**
 * Run `Observable` `source` through chain of transformers
 * @param {Observable<any>} source
 * @param {string[]} transformerChain
 * @param {FromTransformersOptions} [options]
 */
export const fromTransformers = (source, transformerChain, options = {}) =>
  loadTransforms(transformerChain, options).pipe(
    runTransforms(source, options.config, options.overrides)
  );

/**
 * @template T
 * @typedef {import('@report-toolkit/common/src/observable').Observable} Observable
 */

/**
 * @typedef {Object} FromTransformersOptions
 * @property {string} [beginWith] - Begin transformer chain with this type
 * @property {string} [endWith] - End transformer chain with this type
 * @property {string} [defaultTransformer] - Default transformer
 * @property {object} [config] - Complete transformer configuration object
 * @property {object} [overrides] - User-supplied overrides
 */
