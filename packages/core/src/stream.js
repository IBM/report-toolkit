import {_, createDebugPipe, isReport, observable} from '@report-toolkit/common';
import {diffReports} from '@report-toolkit/diff';
import {
  createRule,
  fromBuiltinRules,
  inspectReports,
  toReportFromObject
} from '@report-toolkit/inspector';
import {
  runTransformer,
  toTransformer,
  validateTransformerChain
} from '@report-toolkit/transformers';

const {
  defer,
  filter,
  from,
  fromAny,
  map,
  mergeMap,
  of,
  pipeIf,
  take,
  toArray,
  toObjectFromJSON
} = observable;

const debug = createDebugPipe('core', 'stream');

/**
 *
 * @param {object} [opts]
 * @returns {OperatorFunction<Report[],object>}
 */
export const toReportDiff = (opts = {}) => reports =>
  reports.pipe(
    take(2),
    pipeIf(
      /** @param {any} value */
      value => !isReport(value),
      mergeMap(report => reportFrom(report, opts))
    ),
    toArray(),
    diffReports(opts)
  );

/**
 *
 * @param {object|object[]|Promise<object>|Promise<object[]>} reports
 * @param {*} [opts]
 */
export const diff = (reports, opts = {}) =>
  fromAny(reports).pipe(
    take(2),
    toReport(opts),
    toArray(),
    toReportDiff(opts)
  );

/**
 *
 * @param {string|object} value - Report as JSON string or parsed report
 * @param {*} [opts]
 */
export const reportFrom = (value, opts = {}) =>
  defer(() =>
    (_.isString(value) ? reportFromJSON : reportFromObject)(value, opts)
  );

/**
 *
 * @param {string} json - Report as JSON string
 * @param {*} [opts]
 */
export const reportFromJSON = (json, opts = {}) =>
  of(json).pipe(
    toObjectFromJSON(),
    toReportFromObject(opts)
  );

/**
 *
 * @param {object} obj - Raw parsed report object
 * @param {*} [opts]
 */
export const reportFromObject = (obj, opts = {}) =>
  of(obj).pipe(toReportFromObject(opts));

/**
 *
 * @param {object} [opts]
 * @returns {OperatorFunction<any,Report>}
 */
export const toReport = (opts = {}) => observable =>
  observable.pipe(mergeMap(value => reportFrom(value, opts)));

/**
 *
 * @param {object} [config] - Raw rule configuration
 * @returns {OperatorFunction<RuleDefinition,RuleConfig>}
 */
export const toRuleConfig = (config = {}) => {
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

export {parseConfig} from '@report-toolkit/config';

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

export {fromBuiltinRules};
export {toReportFromObject, inspectReports};

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
