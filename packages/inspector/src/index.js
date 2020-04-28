import {
  createDebugPipe,
  createReport,
  error,
  isReportLike,
  observable,
  redact
} from '@report-toolkit/common';

import {Message} from './message.js';
import {createRuleConfig, RuleConfig} from './rule-config.js';
import {createRule, Rule} from './rule.js';

const {RTKERR_INVALID_REPORT} = error;
const {mergeMap, pipeIf, map, switchMapTo, throwRTkError} = observable;
const debug = createDebugPipe('inspector');

export {rules} from './rules/index.js';

/**
 * Pipes `Report` objects into each `RuleConfig`, then filters on severity level.
 * @param {import('rxjs').Observable<import('@report-toolkit/common').Report>} reports - Stream of Report objects
 * @returns {import('rxjs').OperatorFunction<RuleConfig,Message>}
 */
export const inspectReports = reports => ruleConfigs =>
  ruleConfigs.pipe(
    mergeMap(ruleConfig => ruleConfig.inspect(reports)),
    debug(msg => `received message ${JSON.stringify(msg)}`)
  );

export {createRule, Rule, createRuleConfig, RuleConfig, Message};

/**
 *
 * @param {Partial<ToReportFromObjectOptions>} [opts]
 * @returns {import('rxjs').OperatorFunction<object,Readonly<import('@report-toolkit/common').Report>>}
 */
export function toReportFromObject({showSecretsUnsafe = false} = {}) {
  return observable =>
    observable.pipe(
      pipeIf(
        showSecretsUnsafe !== true,
        map(obj =>
          obj.rawReport
            ? {...obj, rawReport: redact(obj.rawReport)}
            : {rawReport: redact(obj)}
        )
      ),
      pipeIf(
        ({rawReport}) => !isReportLike(rawReport),
        switchMapTo(
          throwRTkError(
            RTKERR_INVALID_REPORT,
            'Encountered a thing that does not look like a report!'
          )
        )
      ),
      map(({filepath, rawReport}) => createReport(rawReport, filepath))
    );
}

/**
 * @typedef {import('./rule').RuleDefinition} RuleDefinition
 */

/**
 * @typedef {object} ToReportFromObjectOptions
 * @property {boolean} showSecretsUnsafe - If `true`, do not redact secrets
 */
