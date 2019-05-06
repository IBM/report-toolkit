import {EMPTY, from, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

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

const search = (fromDirpath, opts = {}) =>
  from(getExplorer(opts).search(fromDirpath));

const load = (filepath, opts = {}) => from(getExplorer(opts).load(filepath));

const process = configResult => {
  let config = {};
  if (configResult) {
    debug(`found config file in ${configResult.filepath}`);
    config = flattenConfig(_.getOr({}, 'config.config', configResult));
  }
  return config;
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
        throw new Error(
          `unknown builtin config at position ${idx}: "${value}"`
        );
      }
    } else if (_.isObject(value)) {
      push(
        _.has('config', value)
          ? flattenConfig(value.config, configObjects)
          : value
      );
    } else {
      throw new Error(`invalid config value: "${value}"`);
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

const fromDir = (dirpath, opts = {}) =>
  search(dirpath, opts).pipe(map(process));

export const loadConfig = ({config, searchPath, search = true} = {}) => {
  let retval;
  if (_.isString(config)) {
    debug(`attempting to load config at path ${config}`);
    retval = load(config).pipe(
      catchError(err => {
        if (err.code === 'ENOENT') {
          debug(
            `failed to load config at path ${config}; re-trying as directory`
          );
          return search(config);
        }
      }),
      map(process)
    );
  } else if (_.isPlainObject(config) || _.isArray(config)) {
    debug('loading config from object: %j', {config});
    retval = of(flattenConfig({config}));
  } else if (search) {
    debug(`searching for config within ${searchPath || 'default location'}`);
    retval = fromDir(searchPath);
  } else {
    debug(`no config found (searching was ${search ? 'enabled' : 'disabled'})`);
    return EMPTY;
  }
  return retval;
};
