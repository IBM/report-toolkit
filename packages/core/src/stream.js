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
  createRule,
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

const {
  createRTkError,
  RTKERR_INVALID_PARAMETER,
  RTKERR_RULE_NAME_COLLISION
} = error;
const {
  defer,
  filter,
  from,
  fromAny,
  iif,
  map,
  mergeAll,
  mergeMap,
  of,
  pipeIf,
  pluck,
  share,
  switchMap,
  take,
  tap,
  toArray,
  toObjectFromJSON,
  throwRTkError
} = observable;

const {ERROR} = constants;
const debug = createDebugPipe('core', 'stream');

/**
 * @type {Map<string,Plugin>}
 */
const registeredPlugins = new Map();

/**
 * @type {Map<string,RuleDefinition>}
 */
const registeredRuleDefinitions = new Map();

/**
 *
 * @param {string} id - Plugin ID (module name or path to module)
 * @returns {Observable<RuleDefinition>}
 */
const fromPluginRules = id =>
  use(id).pipe(
    pipeIf(
      _.has('rules'),
      pluck('rules'),
      mergeAll(),
      pipeIf(
        /**
         * @param {RuleDefinition} ruleDef
         */
        ruleDef =>
          registeredRuleDefinitions.has(ruleDef.id) &&
          registeredRuleDefinitions.get(ruleDef.id) !== ruleDef,
        switchMap(ruleDef =>
          throwRTkError(
            RTKERR_RULE_NAME_COLLISION,
            `rule name collision! "${ruleDef.id}" already registered`
          )
        )
      ),
      pipeIf(
        /**
         * @param {RuleDefinition} ruleDef
         */
        ruleDef => !registeredRuleDefinitions.has(ruleDef.id),
        tap(ruleDef => registeredRuleDefinitions.set(ruleDef.id, ruleDef)),
        debug(({id}) => `registered rule "${id}"`)
      )
    )
  );

/**
 *
 * @param {string} id - plugin id (module name) to register
 * @returns {Observable<Plugin>}
 */
const use = id =>
  iif(
    () => registeredPlugins.has(id),
    of(registeredPlugins.get(id)),
    of(id).pipe(
      map(id => [
        id,
        require.resolve(id, {
          paths: [...module.paths, process.cwd()]
        })
      ]),
      debug(([id, pluginPath]) => `resolved plugin "${id}" to ${pluginPath}`),
      map(([id, pluginPath]) => [id, require(pluginPath)]),
      map(([id, plugin]) => {
        registeredPlugins.set(id, plugin);
        return plugin;
      })
    )
  );

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
      map(ruleDefinition => createRule(ruleDefinition).toRuleConfig(config))
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
  fromRegisteredRuleDefinitions().pipe(
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

export {toReportFromObject, compatibleTransforms, builtinTransformerIds};

/**
 * @returns {Observable<RuleDefinition>}
 */
export const fromRegisteredRuleDefinitions = () => {
  return registeredRuleDefinitions.size
    ? _.pipe(
        _.toPairs,
        _.fromPairs,
        _.values,
        from
      )(registeredRuleDefinitions)
    : fromPluginRules('@report-toolkit/inspector');
};

/**
 * @template T
 * @typedef {import('rxjs').Observable<T>} Observable
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
/**
 * @typedef {{rules?: RuleDefinition[]}} Plugin
 */
