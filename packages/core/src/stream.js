import {
  _,
  constants,
  createDebugPipe,
  observable
} from '@report-toolkit/common';
import {parseConfig} from '@report-toolkit/config';
import {inspectReports, toReportFromObject} from '@report-toolkit/inspector';
import {
  builtinTransformerIds,
  compatibleTransforms,
  runTransformer,
  toTransformer,
  validateTransformerChain
} from '@report-toolkit/transformers';
import resolveFrom from 'resolve-from';

import {toReport, toReportDiff, toRuleConfig} from './internal.js';

const {
  from,
  fromAny,
  iif,
  map,
  mapTo,
  mergeAll,
  mergeMap,
  of,
  pipeIf,
  share,

  pluck,
  tap
} = observable;

const {ERROR} = constants;
const debug = createDebugPipe('core', 'stream');

const BUILTIN_PLUGINS = ['@report-toolkit/inspector'];

/**
 * @type {Map<string,Plugin>}
 */
const registeredPlugins = new Map();

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

export const loadConfig = config =>
  fromAny(config).pipe(
    parseConfig(),
    pipeIf(
      config => _.isEmpty(config.plugins),
      map(config => ({...config, plugins: BUILTIN_PLUGINS}))
    ),
    mergeMap(config =>
      from(config.plugins).pipe(
        mergeMap(use),
        mapTo(config)
      )
    )
  );

/**
 *
 * @param {string[]|string} transformerIds - List of Transformer IDs
 * @param {*} [config]
 */
export const fromTransformerChain = (transformerIds, config = {}) =>
  fromAny(transformerIds).pipe(
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
export const fromRegisteredRuleDefinitions = () =>
  iif(
    () => Boolean(registeredPlugins.size),
    _.pipe(
      _.toPairs,
      _.fromPairs,
      _.values,
      from
    )(registeredPlugins),
    from(BUILTIN_PLUGINS).pipe(mergeMap(use))
  ).pipe(
    pluck('rules'),
    mergeAll()
  );

/**
 *
 * @param {string} id - plugin id (module id/path) to register, or plugin itself
 * @returns {Observable<Plugin>}
 */
export const use = id =>
  iif(
    () => isPluginRegistered(id),
    of(registeredPlugins.get(id)),
    of(id).pipe(
      debug(id => `trying to resolve plugin "${id}"`),
      map(id => {
        try {
          return require.resolve(id);
        } catch (ignored) {
          return resolveFrom(process.cwd(), id);
        }
      }),
      debug(pluginPath => `resolved plugin "${id}" to ${pluginPath}`),
      map(require),
      tap(plugin => {
        registeredPlugins.set(id, plugin);
      }),
      pipeIf(
        _.has('rules'),
        debug(
          plugin => `found ${plugin.rules.length} rules within plugin "${id}"`
        )
      )
    )
  );

/**
 * @returns {boolean} `true` if plugins were cleared; `false` if none registered
 */
export const deregisterPlugins = () => {
  if (registeredPlugins.size) {
    registeredPlugins.clear();
    return true;
  }
  return false;
};

/**
 * Returns `true` if plugin with id `id` has already been registered.
 * @param {string} pluginId - Unique module id
 */
export const isPluginRegistered = pluginId => registeredPlugins.has(pluginId);

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
