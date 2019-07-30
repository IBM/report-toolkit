import {
  _,
  constants,
  createDebugPipe,
  observable
} from '@report-toolkit/common';

const {ERROR, INFO, WARNING} = constants;
const {filter, mergeMap} = observable;
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
 * @returns {Observable<Message>}
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
