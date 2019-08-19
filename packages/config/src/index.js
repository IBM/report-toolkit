import {
  _,
  constants,
  createDebugger,
  error,
  observable,
  symbols
} from '@report-toolkit/common';

import {config as recommended} from './configs/recommended.js';

const {NAMESPACE} = constants;
const {map} = observable;
const {kFlattenedConfig} = symbols;
const debug = createDebugger('config');
const {RTKERR_INVALID_CONFIG, RTKERR_UNKNOWN_BUILTIN_CONFIG, RTkError} = error;
const TRUE_VALUES = new Set(['on', 'yes']);
const FALSE_VALUES = new Set(['off', 'no']);
const DEFAULT_CONFIG_SHAPE = {
  diff: {},
  inspect: {},
  redact: {},
  rules: {},
  transform: {},
  plugins: []
};

const normalizeBooleans = obj =>
  _.traverse(obj).map(function(value) {
    if (_.isString(value)) {
      if (TRUE_VALUES.has(value)) {
        this.update(true);
      } else if (FALSE_VALUES.has(value)) {
        this.update(false);
      }
    }
  });

const pushToConfigList = list => value =>
  list.push(normalizeBooleans(_.omit('name', value)));

/**
 * Recursively parses a user-supplied config Object into a usable format.
 * @param {any} config - A config object
 * @param {any[]} configObjects - Flattened config objects
 * @todo Configs must be validated against a config schema in a depth-first
 * manner.
 * @todo This might make sense to implement as an Object.
 * https://gieseanw.wordpress.com/2019/05/10/algorithms-as-objects/
 * @returns {Object} Flattened config
 */
const flattenConfig = (config, configObjects = []) => {
  if (config[kFlattenedConfig]) {
    debug('Config already processed');
    return config;
  }

  const push = pushToConfigList(configObjects);
  const flatten = value => {
    if (_.isString(value)) {
      if (BUILTIN_CONFIGS.has(value)) {
        push(BUILTIN_CONFIGS.get(value));
      } else {
        throw RTkError.create(
          RTKERR_UNKNOWN_BUILTIN_CONFIG,
          `Unknown builtin config: "${value}"`
        );
      }
    } else if (_.isObject(value)) {
      push(
        _.has('config', value)
          ? flattenConfig(
              // @ts-ignore
              value.config,
              configObjects
            )
          : value
      );
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

  const retval = _.defaultsDeepAll(_.reverse(configObjects));
  retval[kFlattenedConfig] = true;
  debug('flattened config: %O', retval);
  return retval;
};

// XXX: move this
export const BUILTIN_CONFIGS = new Map([
  [`${NAMESPACE}:${recommended.name}`, recommended]
]);

export const filterEnabledRules = _.pipe(
  _.getOr({}, 'rules'),
  _.toPairs,
  _.reduce(
    (acc, [key, value]) =>
      (_.isArray(value) && value[0]) || value ? _.concat(acc, key) : acc,
    []
  ),
  _.tap(ruleIds => {
    debug(`found ${ruleIds.length} enabled rule(s)`);
  })
);

export const parseConfig = () => observable =>
  observable.pipe(
    // XXX: unary used because flattenConfig is a bad algorithm
    map(_.unary(flattenConfig)),
    map(_.defaults(DEFAULT_CONFIG_SHAPE))
  );
