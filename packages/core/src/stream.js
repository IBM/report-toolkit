import {_} from '@gnostic/common';
import {
  DEFAULT_DIFF_OPTIONS,
  DEFAULT_LOAD_REPORT_OPTIONS
} from '@gnostic/common/src/constants.js';
import {createDebugPipe} from '@gnostic/common/src/debug.js';
import {GNOSTIC_ERR_INVALID_PARAMETER} from '@gnostic/common/src/error.js';
import {
  defer,
  filter,
  fromAny,
  isObservable,
  map,
  mergeMap,
  of,
  pipeIf,
  share,
  sort,
  take,
  throwGnosticError,
  toArray,
  toObjectFromJSON
} from '@gnostic/common/src/observable.js';
import {redact} from '@gnostic/common/src/redact.js';
import {diffReports} from '@gnostic/diff';
import {createRule, createRuleConfig, inspectReports} from '@gnostic/inspector';
import {createReport, isReport} from '@gnostic/report';

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

export const toInspection = (reports, opts = {}) => {
  const {
    severity,
    showSecretsUnsafe,
    sortField,
    sortDirection,
    disableSort
  } = _.defaults(DEFAULT_LOAD_REPORT_OPTIONS, opts);
  const multicastReports = defer(() =>
    reports.pipe(
      toReport({
        showSecretsUnsafe,
        sortField,
        sortDirection,
        disableSort
      }),
      share()
    )
  );
  return ruleConfigs =>
    defer(() =>
      isObservable(reports)
        ? ruleConfigs.pipe(inspectReports(multicastReports, {severity}))
        : throwGnosticError(
            GNOSTIC_ERR_INVALID_PARAMETER,
            'inspect() requires an Observable of reports'
          )
    );
};

export const inspect = (reports, rules, config, {severity} = {}) =>
  fromAny(rules).pipe(
    map(createRuleConfig(config)),
    toInspection(fromAny(reports).pipe(toReport), {severity})
  );

export const toReportFromObject = (opts = {}) => {
  const {showSecretsUnsafe, sortField, sortDirection, disableSort} = _.defaults(
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
      map(({rawReport, filepath}) => createReport(rawReport, filepath)),
      pipeIf(!disableSort, sort(`rawReport.${sortField}`, sortDirection))
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
      map(({ruleDef, filepath, id}) =>
        createRule(ruleDef, {filepath, id}).toRuleConfig(config)
      )
    );
};

export {createRule};
