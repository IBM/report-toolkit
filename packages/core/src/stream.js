import {
  _,
  constants,
  createDebugPipe,
  error,
  observable,
  redact
} from '@report-toolkit/common';
import {diffReports} from '@report-toolkit/diff';
import {
  createRule,
  createRuleConfig,
  inspectReports
} from '@report-toolkit/inspector';
import {createReport, isReport} from '@report-toolkit/report';

const {DEFAULT_DIFF_OPTIONS, DEFAULT_LOAD_REPORT_OPTIONS} = constants;

const {REPORT_TOOLKIT_ERR_INVALID_PARAMETER} = error;
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
              REPORT_TOOLKIT_ERR_INVALID_PARAMETER,
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
  if (!ruleIdsCount) {
    debug(
      'no enabled rules found; enabling ALL built-in rules in an attempt to be useful'
    );
  }

  return ruleDefs =>
    ruleDefs.pipe(
      pipeIf(ruleIdsCount, filter(({id}) => Boolean(_.get(id, config.rules)))),
      map(({filepath, id, ruleDef}) =>
        createRule(ruleDef, {filepath, id}).toRuleConfig(config)
      )
    );
};

export {createRule};
