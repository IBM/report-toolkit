import {
  _,
  constants,
  createDebugPipe,
  error,
  isReport,
  observable
} from '@report-toolkit/common';
import {parseConfig} from '@report-toolkit/config';
import {diffReports} from '@report-toolkit/diff';
import {
  builtinRuleDefinitions,
  createRule,
  fromBuiltinRules,
  inspectReports,
  toReportFromObject
} from '@report-toolkit/inspector';
import {
  builtinTransformerIds,
  compatibleTransforms,
  runTransformer,
  toTransformer,
  validateTransformerChain
} from '@report-toolkit/transformers';

const {createRTkError, RTKERR_INVALID_PARAMETER} = error;
const {
  defer,
  filter,
  from,
  fromAny,
  map,
  mergeMap,
  of,
  pipeIf,
  share,
  take,
  tap,
  toArray,
  toObjectFromJSON
} = observable;

const {ERROR} = constants;
const debug = createDebugPipe('core', 'stream');

/**
 *
 * @param {object} [config] - Raw rule configuration
 * @returns {OperatorFunction<RuleDefinition,RuleConfig>}
 */
const toRuleConfig = (config = {}) => {
  const ruleIdsCount = _.getOr(0, 'rules.length', config);
  return ruleDefs =>
    ruleDefs.pipe(
      pipeIf(!ruleIdsCount, debug(() => 'whitelisting rules by default')),
      pipeIf(ruleIdsCount, filter(({id}) => Boolean(_.get(id, config.rules)))),
      map(({id, ruleDefinition}) =>
        createRule({...ruleDefinition, id}).toRuleConfig(config)
      )
    );
};
/**
 *
 * @param {object} [opts]
 * @returns {OperatorFunction<Report[],object>}
 */
const toReportDiff = (opts = {}) => reports =>
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
const toReport = (opts = {}) => observable =>
  observable.pipe(
    pipeIf(
      value => !isReport(value),
      mergeMap(value => reportFrom(value, opts))
    )
  );

/**
 * Diff two reports
 * @param {ReportLike} report1 - First report
 * @param {ReportLike} report2 - Second report
 * @param {*} [opts]
 * @todo `opts` needs typings & distillation
 */
export const diff = (report1, report2, opts = {}) =>
  fromAny([report1, report2]).pipe(toReportDiff(opts));

/**
 *
 * @param {ReportLike} reports - One or more Reports
 * @param {Partial<CoreInspectOptions>} [opts] - Options
 */
export const inspect = (
  reports,
  {ruleConfig: rules = [], severity = ERROR} = {}
) =>
  fromBuiltinRules().pipe(
    toRuleConfig({rules}),
    inspectReports(
      fromAny(reports).pipe(
        toReport(),
        share()
      ),
      {severity}
    )
  );

export const loadConfig = config => fromAny(config).pipe(parseConfig());

/**
 *
 * @param {string[]} transformerIds - List of Transformer IDs
 * @param {*} [config]
 */
export const fromTransformerChain = (transformerIds, config = {}) =>
  from(transformerIds).pipe(
    map(id => ({
      id,
      config: _.merge(config, _.getOr({}, `transformers.${id}`, config))
    }))
  );

/**
 * Run `Observable` `source` through chain of transformers
 * @param {Observable<any>} source
 * @param {FromTransformersOptions} [options]
 * @returns {OperatorFunction<TransformerConfig,any>} Result of transforms
 */
export const transform = (source, options = {}) => observable =>
  observable.pipe(
    toTransformer(),
    validateTransformerChain(options),
    runTransformer(source)
  );

export {
  toReportFromObject,
  fromBuiltinRules,
  builtinRuleDefinitions,
  compatibleTransforms,
  builtinTransformerIds
};

/**
 * @template T
 * @typedef {import('rxjs').Observable} Observable
 */
/**
 * @typedef {Object} FromTransformersOptions
 * @property {string} [beginWith] - Begin transformer chain with this type
 * @property {string} [endWith] - End transformer chain with this type
 * @property {string} [defaultTransformer] - Default transformer
 */
/**
 * @typedef {import('@report-toolkit/transformers').TransformerConfig} TransformerConfig
 * @typedef {import('@report-toolkit/common').Report} Report
 * @typedef {import('@report-toolkit/inspector/src/rule').RuleDefinition} RuleDefinition
 * @typedef {import('@report-toolkit/inspector').RuleConfig} RuleConfig
 */
/**
 * @template T,U
 * @typedef {import('rxjs/internal/types').OperatorFunction<T,U>} OperatorFunction
 */
/**
 * @typedef {string|object|Report|Promise<string|object|Report>|Observable<string|object|Report>} ReportLike
 */
/**
 * @typedef {object} CoreInspectOptions
 * @property {object} ruleConfig - Per-rule configuration object
 * @property {string} severity - Severity threshold
 * @todo severity needs to be an enum
 */
