import {
  _,
  constants,
  createDebugPipe,
  isReport,
  observable
} from '@report-toolkit/common';
import {diffReports} from '@report-toolkit/diff';
import {
  createRule,
  createRuleConfig,
  fromBuiltinRules,
  inspectReports,
  toReportFromObject
} from '@report-toolkit/inspector';
import {
  runTransformer,
  toTransformer,
  validateTransformerChain
} from '@report-toolkit/transformers';
const {ERROR} = constants;

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

export const toReportDiff = (opts = {}) => {
  return reports =>
    reports.pipe(
      take(2),
      pipeIf(
        value => !isReport(value),
        mergeMap(report => reportFrom(report, opts))
      ),
      toArray(),
      diffReports(opts)
    );
};

export const diff = (reports, opts = {}) =>
  fromAny(reports).pipe(
    take(2),
    toReport(opts),
    toArray(),
    toReportDiff(opts)
  );

export const inspect = (reports, rules, config, {severity = ERROR} = {}) =>
  fromAny(rules).pipe(
    map(createRuleConfig(config)),
    inspectReports(fromAny(reports).pipe(toReport), {severity})
  );

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
 * @typedef {import('@report-toolkit/common/src/observable').Observable} Observable
 */

/**
 * @typedef {Object} FromTransformersOptions
 * @property {string} [beginWith] - Begin transformer chain with this type
 * @property {string} [endWith] - End transformer chain with this type
 * @property {string} [defaultTransformer] - Default transformer
 */
/**
 * @typedef {import('@report-toolkit/transformers').TransformerConfig} TransformerConfig
 */
/**
 * @template T,U
 * @typedef {import('rxjs/internal/types').OperatorFunction<T,U>} OperatorFunction
 */
