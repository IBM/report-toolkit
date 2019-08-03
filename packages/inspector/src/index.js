import {
  _,
  constants,
  createDebugPipe,
  createReport,
  observable,
  redact
} from '@report-toolkit/common';

import {builtinRuleDefinitions} from './rules/index.js';

const {ERROR, INFO, WARNING, DEFAULT_LOAD_REPORT_OPTIONS} = constants;
const {filter, from, mergeMap, pipeIf, map, sort} = observable;
const debug = createDebugPipe('inspector');

const SEVERITIES = {
  [ERROR]: 30,
  [INFO]: 10,
  [WARNING]: 20
};

export const BUILTIN_RULES_DIR = 'rules';

/**
 * Pipes `Report` objects into each `RuleConfig`, then filters on severity level.
 * @param {Observable<Report>} reports - Stream of Report objects
 * @param {import('@report-toolkit/common/src/constants').InspectReportOptions} [opts] - Optional opts
 * @returns {OperatorFunction<RuleConfig, Message>}
 */
export const inspectReports = (
  reports,
  {severity = ERROR} = {}
) => ruleConfigs =>
  ruleConfigs.pipe(
    mergeMap(ruleConfig => ruleConfig.inspect(reports)),
    debug(msg => `received message ${JSON.stringify(msg)}`),
    filter(
      _.pipe(
        _.get('severity'),
        _.get(_.__, SEVERITIES),
        _.gte(_.__, SEVERITIES[severity])
      )
    )
  );

export {createRule} from './rule.js';
export {createRuleConfig} from './rule-config.js';

export const fromBuiltinRules = () => from(builtinRuleDefinitions);

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

/**
 * @template T
 * @typedef {import('rxjs').Observable<T>} Observable
 */
/**
 * @template T,U
 * @typedef {import('rxjs/internal/types').OperatorFunction} OperatorFunction
 */
/**
 * @typedef {import('@report-toolkit/common').Report} Report
 */
/**
 * @typedef {import('./message').Message} Message
 */
/**
 * @typedef {import('./rule-config').RuleConfig} RuleConfig
 */
