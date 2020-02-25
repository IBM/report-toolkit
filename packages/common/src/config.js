import {_} from './util.js';
import {createDebugger} from './debug.js';
import {
  RTKERR_INVALID_CONFIG,
  RTKERR_UNKNOWN_BUILTIN_CONFIG,
  RTkError
} from './error.js';
import {map} from './observable.js';
import {kFlattenedConfig} from './symbols.js';

import recommendedConfig from './configs/recommended.js';
const recommended = recommendedConfig.config;

const debug = createDebugger('common', 'config');

/**
 * @type {Config}
 */
const DEFAULT_CONFIG_SHAPE = {
  commands: {},
  rules: {},
  plugins: [],
  transformers: {}
};

/**
 * Recursively parses a user-supplied config Object into a usable format.
 * @param {ExportedConfig} config - A config object
 * @param {ExportedConfig} configObjects - Flattened config objects
 * @todo Configs must be validated against a config schema in a depth-first
 * manner.
 * @todo This might make sense to implement as an Object.
 * https://gieseanw.wordpress.com/2019/05/10/algorithms-as-objects/
 * @returns {Config} Flattened config
 */
const flattenConfig = (config, configObjects = []) => {
  if (_.has(kFlattenedConfig, config)) {
    debug('Config already processed');

    return /** @type {Config} */ (config);
  }

  /**
   * This dumb recursive function flattens a config.
   * @todo rewrite this as a loop.
   * @todo deeper object validation; use AJV probably
   * @param {ConfigListItem} value
   */
  const flatten = value => {
    if (_.has(kFlattenedConfig, value)) {
      debug('Config already processed');
      return configObjects.push(value);
    }

    if (_.isString(value) && BUILTIN_CONFIGS.has(value)) {
      const builtin = BUILTIN_CONFIGS.get(value);
      if (_.isArray(builtin) || _.isString(builtin)) {
        return configObjects.push(flattenConfig(builtin, configObjects));
      } else {
        value = builtin;
      }
    }
    if (_.isString(value)) {
      throw RTkError.create(
        RTKERR_UNKNOWN_BUILTIN_CONFIG,
        `Unknown builtin config: "${value}".`
      );
    } else if (!Array.isArray(value) && _.isObject(value)) {
      if (_.has('config', value)) {
        configObjects.push(
          flattenConfig(
            /** @type {ConfigModule} */ (value).config,
            configObjects
          )
        );
      } else {
        _.pipe(
          _.keys,
          _.forEach(k => {
            if (!_.has(k, DEFAULT_CONFIG_SHAPE)) {
              throw RTkError.create(
                RTKERR_INVALID_CONFIG,
                `Invalid config key found: "${k}"`
              );
            }
          })
        )(value);
        configObjects.push(value);
      }
    } else {
      throw RTkError.create(
        RTKERR_INVALID_CONFIG,
        `Invalid config value: "${value}"`
      );
    }
  };

  if (_.isArray(config)) {
    config.forEach(flatten);
  } else {
    flatten(config);
  }

  /**
   * @type {Config}
   */
  const retval = _.defaultsDeepAll([..._.reverse(configObjects)]);
  debug('flattened config: %O', retval);
  return retval;
};

export const RECOMMENDED_CONFIG_ALIAS = recommendedConfig.alias;

/**
 * @type {Map<BuiltinConfigAliases,ExportedConfig>}
 * @todo move this
 */
export const BUILTIN_CONFIGS = new Map([
  [RECOMMENDED_CONFIG_ALIAS, recommended]
]);

/**
 * Given a {@link Config}, return a list of rules that are enabled.
 * @param {Config} config - Parsed config
 * @returns {string[]} List of rule IDs
 */
export function filterEnabledRules(config) {
  return _.pipe(
    _.getOr({}, 'rules'),
    _.toPairs,
    _.reduce(
      (enabledRules, [ruleName, ruleConfig]) =>
        (_.isObject(ruleConfig) && _.get('enabled', ruleConfig)) ||
        (_.isBoolean(ruleConfig) && ruleConfig)
          ? [ruleName, ...enabledRules]
          : enabledRules,
      []
    ),
    _.tap(ruleIds => {
      debug('found %d enabled rule(s)', ruleIds.length);
    })
    // @ts-ignore -- problem with _.pipe type?
  )(config);
}

/**
 * Assign the "flattened config" symbol to complete the config.
 * Add default fields.
 * @param {Partial<Config>} config - Config to mark flattened
 * @returns {Config} The "final" config
 */
export function normalizeFlattenedConfig(config) {
  return /** @type {Config} */ ({
    ..._.merge(DEFAULT_CONFIG_SHAPE, config),
    [kFlattenedConfig]: true
  });
}

/**
 * Given an `Observable` of {@link ExportedConfig} arrays, return a single,
 * flattened {@link Config} object.  Config object will have a
 * `kFlattenedConfig` `Symbol` property set to `true`.
 * @todo Eliminate extra empty properties
 * @returns {import('rxjs').OperatorFunction<ExportedConfig|ConfigListItem, Config>}
 */
export function parseConfig() {
  return observable =>
    observable.pipe(map(_.unary(flattenConfig)), map(normalizeFlattenedConfig));
}

/**
 * A list of built-in config aliases. (This is intended to be a union type
 * if/when other built-in configs are added.)
 * @typedef {"rtk:recommended"} BuiltinConfigAliases
 */

/**
 * The exports of a builtin config file.
 * @typedef {ConfigModule} BuiltinConfigModule
 * @property {BuiltinConfigAliases} alias - Alias (used by builtin configs only)
 */

/**
 * The exports of a config file. There should be only one; `config`, which may
 * be a {@link Config} or {@link ExportedConfig}.
 * @typedef {Object} ConfigModule
 * @property {ConfigListItem[]} config - The exported configuration
 */

/**
 * A configuration object. Each configuration file exports an
 * {@link ExportedConfig} array containing one or more of these.
 * @typedef {FlattenedConfigMarker|ConfigProps} Config
 */

/**
 * Alias for the `config` prop of a config file or {@link ConfigModule}. See
 * {@link ConfigListItem}.
 * @typedef {ConfigListItem[]} ExportedConfig
 */

/**
 * An item in the `config` prop of a config file or {@link ConfigModule}.
 * @typedef {Partial<Config>|ConfigModule|BuiltinConfigAliases} ConfigListItem
 */

/**
 * Properties of a {@link Config} object.
 * @typedef {Object} ConfigProps
 * @property {string[]} plugins - Zero or more plugin module IDs (as one would `require(id)` them)
 * @property {Partial<RulesConfig>} rules - Rule-specific configurations, keyed by rule name.
 * @property {Partial<TransformerDefaultsConfig>} transformers - Transformer-specific defaults
 * @property {Partial<CommandDefaultsConfig>} commands - Command-specific defaults
 */

/**
 * The symbol attached to a flattened {@link Config}.
 * @typedef {{[kFlattenedConfig]?: true}} FlattenedConfigMarker
 */

/**
 * Command-specific defaults.  Command-line arguments will always override these.
 * @typedef {{[key in CommandName]: object}} CommandDefaultsConfig
 */

/**
 * Valid command names for commands (used with {@link CommandDefaultsConfig}).
 * @typedef {"inspect"|"redact"|"transform"|"diff"} CommandName
 */

/**
 * Per-rule configuration.
 * @typedef {{[key: string]: boolean|RuleConfig}} RulesConfig
 */

/**
 * Valid severity levels.
 * @typedef {"info"|"warning"|"error"} Severity
 */

/**
 * Rule-specific configuration.  `severity` and `enable` will always be usable,
 * otherwise the rest of the properties are defined by the rule.
 * @typedef {{[key: string]: any}} RuleConfig
 * @property {Severity} severity - Max severity of Messages emitted by this
 * rule. Messages with a lower severity will retain the lower severity.
 * Defaults to `error`.
 * @property {boolean} enable - Defaults to `true`. Useful to temporarily
 * disable the rule.
 */

/**
 * A valid transformer name.
 * @typedef {"table"|"json"|"csv"|"filter"|"newline"|"redact"|"stack-hash"} TransformerName
 */

/**
 * Per-transformer defaults, keyed on transformer name.
 * @typedef {{[key in TransformerName]: object}} TransformerDefaultsConfig
 */

/**
 * @template T
 * @typedef {import('./observable').Observable<T>} Observable
 */
