import {_, constants, observable} from '@gnostic/common';

const {ERROR, INFO, WARNING} = constants;
const {filter, map, mergeMap} = observable;

const SEVERITIES = {
  [ERROR]: 30,
  [INFO]: 10,
  [WARNING]: 20
};

export const BUILTIN_RULES_DIR = 'rules';

/**
 * Pipes `Report` objects into each `RuleConfig`, then filters on severity level.
 * @param {Observable<Report>} reports - Stream of Report objects
 * @param {Object} [opts] - Optional opts
 * @param {string} [severity=error] - Severity level to filter on; any message severity *lower* than this will be discarded
 * @returns {Observable<Message>}
 */
export const inspectReports = (
  reports,
  {severity = ERROR} = {}
) => ruleConfigs =>
  ruleConfigs.pipe(
    mergeMap(ruleConfig => ruleConfig.inspect(reports)),
    map(message =>
      _.has('severity', message) ? message : {...message, severity: ERROR}
    ),
    filter(
      message => _.get(message.severity, SEVERITIES) >= SEVERITIES[severity]
    )
  );

export {createRule} from './rule.js';
export {createRuleConfig} from './rule-config.js';
