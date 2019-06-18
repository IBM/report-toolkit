import {
  GNOSTIC_ERR_INVALID_CONFIG,
  GNOSTIC_ERR_MISSING_CONFIG,
  GNOSTIC_ERR_UNKNOWN_BUILTIN_CONFIG,
  GnosticError
} from './error';
import {
  map,
  mapTo,
  mergeMap,
  of,
  pipeIf,
  switchMapTo,
  tap,
  throwGnosticError
} from './observable';

import {BUILTIN_CONFIGS} from './configs';
import _ from 'lodash/fp';
import cosmiconfig from 'cosmiconfig';
import {createDebugger} from './debug';
import pkg from '../package.json';
import traverse from 'traverse';

const debug = createDebugger(module);

const TRUE_VALUES = new Set(['on', 'yes']);
const FALSE_VALUES = new Set(['off', 'no']);

export const kFlattenedConfig = Symbol('flattenedConfig');

const getExplorer = _.memoize(opts =>
  cosmiconfig(
    pkg.name,
    _.defaultsDeep(
      {
        loaders: {'.js': cosmiconfig.loadJs, noExt: cosmiconfig.loadJs}
      },
      opts
    )
  )
);

const fromSearchPath = (opts = {}) => {
  const explorer = getExplorer(opts);
  return observable =>
    observable.pipe(
      mergeMap(dirpath => explorer.search(dirpath)),
      pipeIf(
        _.isObject,
        tap(config => {
          debug(`found config at ${config.filepath}`);
        })
      ),
      map(_.get('config.config'))
    );
};

const fromFile = (opts = {}) => {
  const explorer = getExplorer(opts);
  return observable =>
    observable.pipe(
      mergeMap(filepath => explorer.load(filepath)),
      map(_.get('config.config'))
    );
};

const normalizeBooleans = obj =>
  traverse(obj).map(function(value) {
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
 *
 * @param {Object} config - A config object
 * @param {Object[]} configObjects - Flattened config objects
 * @todo Configs must be validated against a config schema in a depth-first manner
 * @returns {Object} Flattened config
 */
const flattenConfig = (config, configObjects = []) => {
  const push = pushToConfigList(configObjects);
  const flatten = (value, idx = 0) => {
    if (_.isString(value)) {
      if (BUILTIN_CONFIGS.has(value)) {
        push(BUILTIN_CONFIGS.get(value));
      } else {
        throw GnosticError.create(
          GNOSTIC_ERR_UNKNOWN_BUILTIN_CONFIG,
          `Unknown builtin config at position ${idx}: "${value}"`
        );
      }
    } else if (_.isObject(value)) {
      push(
        _.has('config', value)
          ? flattenConfig(value.config, configObjects)
          : value
      );
    } else {
      throw GnosticError.create(
        GNOSTIC_ERR_INVALID_CONFIG,
        `Invalid config value: "${value}"`
      );
    }
  };

  if (config[kFlattenedConfig]) {
    debug('config already flattened');
    return config;
  }

  if (_.isArray(config)) {
    config.forEach(flatten);
  } else {
    flatten(config);
  }

  const retval = _.defaultsDeepAll(_.reverse(configObjects));
  retval[kFlattenedConfig] = true;
  return retval;
};

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

export const loadConfig = ({
  config: rawConfig,
  searchPath,
  search = true
} = {}) =>
  of(rawConfig).pipe(
    pipeIf(_.isString, fromFile()),
    pipeIf(
      rawConfig => _.isEmpty(rawConfig) && search,
      tap(() => {
        debug(`searching in ${searchPath || process.cwd()} for config`);
      }),
      mapTo(searchPath),
      fromSearchPath()
    ),
    pipeIf(
      _.overSome([_.isPlainObject, _.isArray]),
      tap(rawConfig => {
        debug('flattening config from object: %j', rawConfig);
      }),
      map(rawConfig => flattenConfig({config: rawConfig}))
    ),
    pipeIf(
      _.isEmpty,
      switchMapTo(
        throwGnosticError(
          GNOSTIC_ERR_MISSING_CONFIG,
          `No config file found within ${searchPath ||
            'current working directory'}`
        )
      )
    )
  );
