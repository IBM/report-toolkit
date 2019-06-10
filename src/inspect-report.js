import {filter, map, mergeMap} from './observable';

import _ from 'lodash/fp';

export const ERROR = 'error';
export const WARNING = 'warning';
export const INFO = 'info';

const SEVERITIES = {
  [ERROR]: 30,
  [WARNING]: 20,
  [INFO]: 10
};

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
