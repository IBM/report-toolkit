import {
  _,
  constants,
  createDebugPipe,
  error,
  isReport,
  observable,
  config
} from '@report-toolkit/common';
import {diff as diffReports} from '@report-toolkit/diff';
import * as inspector from '@report-toolkit/inspector';
import {
  builtinTransformerIds,
  compatibleTransformers,
  runTransformer,
  toTransformer,
  validateTransformerChain
} from '@report-toolkit/transformers';
import resolveFrom from 'resolve-from';

const {parseConfig, BUILTIN_CONFIGS, RECOMMENDED_CONFIG_ALIAS} = config;
const {createRTkError, RTKERR_INVALID_PARAMETER} = error;
const {
  defaultIfEmpty,
  concat,
  defer,
  filter,
  from,
  fromAny,
  iif,
  map,
  mapTo,
  mergeAll,
  mergeMap,
  of,
  pipeIf,
  pluck,
  share,
  sort,
  take,
  tap,
  toArray,
  toObjectFromJSON
} = observable;

const {SEVERITIES, DEFAULT_SEVERITY} = constants;
const debug = createDebugPipe('core', 'observable');

const BUILTIN_PLUGINS = ['@report-toolkit/inspector'];

const getRuleDefinitions = _.pipe(
  _.toPairs,
  _.fromPairs,
  _.values,
  _.flatMap('rules'),
  _.compact
);

/**
 * @type {Readonly<Partial<InspectOptions>>}
 */
const DEFAULT_INSPECT_OPTIONS = Object.freeze({
  sort: true,
  severity: DEFAULT_SEVERITY,
  showSecretsUnsafe: false,
  sortDirection: 'asc',
  sortField: 'header.dumpEventTimestamp'
});

/**
 * @type {Map<string,RTKPlugin>}
 */
const registeredPlugins = new Map();

/**
 * @param {import('@report-toolkit/common/src/report').ReportLike|string} value - Report as JSON string or parsed report
 * @param {any} [opts]
 */
function reportFrom(value, opts = {}) {
  return _.isString(value)
    ? defer(() => reportFromJSON(value, opts))
    : defer(() => reportFromObject(value, opts));
}
/**
 *
 * @param {string} json - Report as JSON string
 * @param {Partial<InspectOptions>} [opts]
 */
function reportFromJSON(json, opts = {}) {
  return of(json).pipe(toObjectFromJSON(), toReportFromObject(opts));
}

/**
 *
 * @param {import('@report-toolkit/common/src/report').ReportLike} obj - Raw parsed report object
 * @param {Partial<InspectOptions>} [opts]
 */
function reportFromObject(obj, opts = {}) {
  return of(obj).pipe(toReportFromObject(opts));
}

/**
 *
 * @param {Partial<InspectOptions>} [opts]
 * @returns {import('rxjs').OperatorFunction<string|object,import('@report-toolkit/common').Report>}
 */
function toReport(opts = {}) {
  return observable =>
    observable.pipe(
      pipeIf(
        /**
         * @param {any} value
         */
        value => !isReport(value),
        mergeMap(value => reportFrom(value, opts))
      )
    );
}

/**
 *
 * @param {object} [config] - Raw rule configuration
 * @returns {import('rxjs').OperatorFunction<import('@report-toolkit/inspector/src/rule').RuleDefinition,import('@report-toolkit/inspector/src/rule-config').RuleConfig>}
 */
function toRuleConfig(config = {}) {
  const ruleIdsCount = _.getOr(0, 'rules.length', config);
  return ruleDefs =>
    ruleDefs.pipe(
      pipeIf(
        !ruleIdsCount,
        debug(() => 'enabling all rules by default')
      ),
      pipeIf(
        ruleIdsCount,
        filter(({id}) => Boolean(_.get(id, config.rules)))
      ),
      map(ruleDefinition =>
        inspector.createRule(ruleDefinition).toRuleConfig(config)
      )
    );
}

/**
 *
 * @param {Partial<DiffOptions>} [opts]
 * @returns {import('rxjs').OperatorFunction<import('@report-toolkit/common/src/report').Report[],object>}
 */
function toReportDiff(opts = {}) {
  return reports =>
    reports.pipe(
      take(2),
      toReport(),
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
}

/**
 * Returns the difference between two reports.
 *
 * Example:
 *
 * ```js
 * const {diff} = require('@report-toolkit/core').observable;
 *
 * const report1 = process.report.getReport();
 * const report2 = process.report.getReport();
 *
 * diff(report1, report2, {
 *   filterProperties: ['header', 'javascriptStack', 'nativeStack'],
 *   showSecretsUnsafe: false
 * }).subscribe(({op, path, newValue, oldValue}) => {
 *   console.log(`[${op}] <${path}> ${oldValue} => ${newValue}`);
 * })
 * ```
 * @param {import('@report-toolkit/common/src/report').ReportLike|import('@report-toolkit/common/src/observable').Observable<import('@report-toolkit/common/src/report').ReportLike>} report1 - First report to diff
 * @param {import('@report-toolkit/common/src/report').ReportLike|import('@report-toolkit/common/src/observable').Observable<import('@report-toolkit/common/src/report').ReportLike>} report2 - Second report to diff
 * @param {Partial<DiffOptions>} [opts] Options
 * @returns {import('@report-toolkit/common/src/observable').Observable<DiffResult>} Results, one per difference
 * @todo support JSON reports
 */
export function diff(report1, report2, opts = {}) {
  return concat(fromAny(report1), fromAny(report2)).pipe(toReportDiff(opts));
}

/**
 * Inspect one or more reports, running rules against each.  Resolves with an array of zero or more {@link @report-toolkit/inspector.message.Message|Messages}.
 *
 * Example:
 *
 * ```js
 * const {inspect} = require('@report-toolkit/core').observable
 *
 * const report = process.report.getReport();
 * inspect(report, {
 *   severity: 'info',
 *   sort: true,
 *   sortDirection: 'asc',
 *   sortField: 'header.dumpEventTimestamp',
 *   showSecretsUnsafe: false,
 *   ruleConfig: {
 *     'long-timeout': {
 *       timeout: '2s'
 *     }
 *   }
 * }).subscribe({message, filename} => {
 *   console.log(`${filename}: ${message}`);
 * });
 * ```
 * @param {import('@report-toolkit/common/src/report').ReportLike|import('@report-toolkit/common/src/observable').Observable<import('@report-toolkit/common/src/report').ReportLike>} reports - One or more Reports
 * @param {Partial<InspectOptions>} [opts] - Options
 * @returns {import('@report-toolkit/common/src/observable').Observable<import('@report-toolkit/inspector/src/message').Message>}
 */
export function inspect(reports, opts = {}) {
  const {
    ruleConfig: rules,
    severity,
    sort: sortReports,
    sortField,
    sortDirection,
    showSecretsUnsafe
  } = _.defaults(DEFAULT_INSPECT_OPTIONS, opts);
  return fromRegisteredRuleDefinitions().pipe(
    toRuleConfig({rules}),
    inspector.inspectReports(
      fromAny(reports).pipe(
        toReport({showSecretsUnsafe}),
        pipeIf(sortReports, sort(sortField, sortDirection)),
        share()
      )
    ),
    filter(
      _.pipe(
        _.get('severity'),
        _.get(_.__, SEVERITIES),
        _.gte(_.__, SEVERITIES[severity])
      )
    )
  );
}

/**
 * Emits normalized config objects from raw config objects. Only a single input config should be necessary.
 *
 * Example:
 *
 * ```js
 * const {loadConfig} = require('@report-toolkit/core').observable;
 *
 * // or require('./path/to/.rtkrc.js')
 * const rawConfig = [
 *   'report-toolkit:recommended',
 *   {
 *     rules: {
 *       'long-timeout': {
 *         timeout: '2s'
 *       }
 *     }
 *   }
 * ];
 *
 * loadConfig(rawConfig).subscribe(normalizedConfig => {
 *   // `normalizedConfig` contains contents of "recommended" settings,
 *   // with our override of custom rule config
 * });
 * ```
 * @param {object} config - Raw config object
 * @todo ALWAYS load builtin plugin(s)
 * @todo Document config shape
 * @returns {import('@report-toolkit/common/src/observable').Observable<Config>} Normalized config object(s)
 */
export function loadConfig(config) {
  return fromAny(config).pipe(
    defaultIfEmpty(BUILTIN_CONFIGS.get(RECOMMENDED_CONFIG_ALIAS)),
    debug(config => ['received raw config %O', config]),
    parseConfig(),
    pipeIf(
      /**
       @param {object} config
       */
      config => _.isEmpty(config.plugins),
      debug(() => 'no plugins specified; using default set'),
      map(config => ({...config, plugins: BUILTIN_PLUGINS}))
    ),
    mergeMap(config => from(config.plugins).pipe(mergeMap(use), mapTo(config))),
    debug(config => ['final rtk config: %O', config])
  );
}

/**
 * Given a list of transformer IDs, create an `Observable` which emits {@link TransformerBlueprint} objects. Output should be piped to {@link transform}.
 *
 * Example:
 *
 * ```js
 * const {fromTransformerChain} = require('@report-toolkit/core').observable;
 *
 * fromTransformerChain(['filter', 'csv'], {
 *   transformers: {
 *     filter: {include: 'header'},
 *     csv: {flatten: true}
 *   }
 * }); // pipe to transform()
 * ```
 * @param {string[]|string} transformerIds - List of Transformer IDs
 * @param {Partial<Config>} [config] - Normalized config object
 * @returns {import('@report-toolkit/common/src/observable').Observable<TransformerBlueprint>}
 */
export function fromTransformerChain(transformerIds, config = {}) {
  return fromAny(transformerIds).pipe(
    map(id => ({
      id,
      config: _.merge(
        _.omit('transformers', config),
        _.getOr({}, `transformers.${id}`, config)
      )
    })),
    debug(blueprint => [`created transformer blueprint %O`, blueprint])
  );
}

/**
 * Run `source` through chain of one or more transformers.  Pipe {@link fromTransformerChain} into this.
 * Performs validation before piping.
 * While most other functions here will automatically convert a raw report into a `Report` instance for further processing, this one does not (since transformers don't necessarily accept them).  You'll need to do this manually, as seen in the below example.
 * If the final transformer does not output the desired `endType`, the `defaultTransformer` will be appended to the chain; otherwise it is ignored.
 *
 * Example:
 *
 * ```js
 * const {fromTransformerChain, transform, toReportFromObject} = require('@report-toolkit/core').observable;
 *
 * const report$ = toReportFromObject(process.report.getReport());
 * fromTransformerChain(['filter', 'csv'], {
 *   transformers: {
 *     filter: {include: 'header'},
 *     csv: {flatten: true}
 *   }
 * }).pipe(transform(report$)).subscribe(line => {
 *   console.log(line);
 * });
 * ```
 * @param {import('@report-toolkit/common/src/observable').Observable<any>} source - Source data to transform.  Objects, {@link @report-toolkit/common.report.Report|Reports}, etc.
 * @param {Partial<TransformOptions>} [opts] - Options for the transformation
 * @returns {import('rxjs').OperatorFunction<TransformerBlueprint,any>} Result of running `source` through the transformer chains.
 */
export function transform(source, opts = {}) {
  return observable =>
    observable.pipe(
      toTransformer(),
      validateTransformerChain(opts),
      runTransformer(source)
    );
}

export {compatibleTransformers, builtinTransformerIds};

/**
 * Creates a target `Observable` of {@link @report-toolkit/common.report.Report|Report} objects from a source `Observable` of plain objects (usually parsed from a JSON report).
 *
 * Example:
 *
 * ```js
 * const {toReportFromObject} = require('@report-toolkit/core').observable;
 *
 * const json = fs.readFileSync('./report-xxxxx.json');
 * toReportFromObject(json, {
 *   showSecretsUnsafe: false
 * }).subscribe(report => {
 *  // `Report` instance with secrets redacted
 * });
 * ```
 * @param {Partial<ToReportFromObjectOptions>} [opts] - Options
 */
export function toReportFromObject(opts = {}) {
  return inspector.toReportFromObject(opts);
}

/**
 * Get a list of rule definitions contained within registered plugins.
 *
 * Example:
 *
 * ```js
 * const {registeredRuleDefinitions} = require('@report-toolkit/core').observable;
 *
 * registeredRuleDefinitions().forEach(ruleDef => {
 *   console.log(ruleDef.meta.id);
 * })
 * ```
 * @returns {import('@report-toolkit/inspector/src/rule').RuleDefinition[]}
 */
export function registeredRuleDefinitions() {
  // XXX: this is this way because typedoc
  return getRuleDefinitions(registeredPlugins);
}

/**
 * @hidden
 * @todo XXX this is not the right place to load the builtins, and it's essentially redundant with {@link registeredRuleDefinitions}.
 * @returns {import('@report-toolkit/common/src/observable').Observable<import('@report-toolkit/inspector/src/rule').RuleDefinition>}
 */
export function fromRegisteredRuleDefinitions() {
  return iif(
    () => Boolean(registeredPlugins.size),
    _.pipe(_.toPairs, _.fromPairs, _.values, from)(registeredPlugins),
    from(BUILTIN_PLUGINS).pipe(mergeMap(use))
  ).pipe(pluck('rules'), mergeAll());
}

/**
 * Register & enable a plugin.
 *
 * Example:
 *
 * ```js
 * const {use} = require('@report-toolkit/core').observable;
 *
 * use('some-plugin-in-node_modules').subscribe();
 *
 * ```
 * @param {string} pluginId - ID of plugin to register; a resolvable path to a module
 * @returns {import('@report-toolkit/common/src/observable').Observable<RTKPlugin>} A plugin instance, but YAGNI.
 */
export function use(pluginId) {
  return iif(
    () => isPluginRegistered(pluginId),
    of(registeredPlugins.get(pluginId)),
    of(pluginId).pipe(
      debug(id => `trying to resolve plugin "${id}"`),
      map(id => {
        try {
          return require.resolve(id);
        } catch (ignored) {
          return resolveFrom(process.cwd(), id);
        }
      }),
      debug(pluginPath => `resolved plugin "${pluginId}" to ${pluginPath}`),
      map(require),
      tap(plugin => {
        registeredPlugins.set(pluginId, plugin);
      }),
      pipeIf(
        _.has('rules'),
        debug(
          plugin =>
            `found ${plugin.rules.length} rules within plugin "${pluginId}"`
        )
      )
    )
  );
}

/**
 * De-register ("unload") all plugins.
 *
 * Example:
 *
 * ```js
 * const {deregisterPlugins} = require('@report-toolkit/core').observable;
 *
 * console.log(deregisterPlugins()); // `true` or `false`, depending.
 * ```
 * @returns {boolean} `true` if plugins were cleared; `false` if none registered
 */
export function deregisterPlugins() {
  if (registeredPlugins.size) {
    registeredPlugins.clear();
    return true;
  }
  return false;
}

/**
 * Returns `true` if plugin with id `pluginId` has already been registered.
 *
 * ```js
 * const {isPluginRegistered} = require('@report-toolkit/core').observable;
 *
 * console.log(isPluginRegistered('my-plugin')); // `true` or `false`, depending.
 * ```
 * @param {string} pluginId - A unique [module ID](https://nodejs.org/api/modules.html#modules_module_id)
 */
export function isPluginRegistered(pluginId) {
  return registeredPlugins.has(pluginId);
}

/**
 * Options for {@link transform}.
 * @typedef {object} TransformOptions
 * @property {string} beginWith - Begin transformer chain with this type
 * @property {string} endWith - End transformer chain with this type
 * @property {string} defaultTransformer - Default transformer
 * @property {object} defaultTransformerConfig - Default transformer config
 */

/**
 * Represents a "plugin".  As of this writing, plugins may only contain rule definitions for {@link inspect}; it would make sense to add support for transformers, as well.
 * @todo write plugin docs
 * @typedef {object} RTKPlugin
 * @property {import('@report-toolkit/inspector/src/rule').RuleDefinition[]?} rules - An array of rule definitions.
 */

/**
 * Options for {@link inspect}.
 * @typedef {Object} InspectOptions
 * @property {boolean} sort - Whether or not to sort output when multiple reports are provided
 * @property {string} severity - Filter by message severity
 * @property {"asc"|"desc"} sortDirection - Ascending or descending
 * @property {string} sortField - Field to sort by; keypaths are allowed
 * @property {object} ruleConfig - Rule configuration object
 * @property {boolean} showSecretsUnsafe - If `true`, do not redact secrets
 */

/**
 * A single difference between two reports.  Emitted from {@link diff}.
 * @typedef {object} DiffResult
 * @property {"add"|"remove"|"replace"} op - Operation
 * @property {string} path - [RFC6902](https://tools.ietf.org/html/rfc6902)-style keypath
 * @property {string|boolean|number|null?} value - Value from second report (where applicable)
 * @property {string|boolean|number|null?} oldValue - Value from first report (where applicable)
 */

/**
 * Options for {@link diff}.
 * @typedef {object} DiffOptions
 * @property {string[]} includeProperties - Include only these keypaths in the diff
 * @property {string[]} excludeProperties - Exclude these keypaths from the diff
 * @property {boolean} includeAll - Just show the whole diff if `true`
 * @property {boolean} showSecretsUnsafe - If `true`, do not redact secrets
 */

/**
 * A "normalized" configuration object.
 * @typedef {object} Config
 * @todo Describe shape
 */

/**
 * A pairing of a transformer ID and a configuration of that transformer, to be
 * ingested by {@link transform}.
 * @typedef {object} TransformerBlueprint
 * @property {string} id - Transformer ID
 * @property {object?} config - Configuration for transformer
 */

/**
 * Options for {@link toReportFromObject}.
 * @typedef {object} ToReportFromObjectOptions
 * @property {boolean} showSecretsUnsafe - If `true`, do not redact secrets
 */
