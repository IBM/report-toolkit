import {_} from '@gnostic/common';
import {ERROR, INFO, WARNING} from '@gnostic/common/src/constants.js';
import {filter, map, mergeMap} from '@gnostic/common/src/observable.js';
export {createRule} from './rule.js';
export {createRuleConfig} from './rule-config.js';

const SEVERITIES = {
  [ERROR]: 30,
  [WARNING]: 20,
  [INFO]: 10
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
