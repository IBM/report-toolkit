import {BUILTIN_CONFIGS} from './configs';
import _ from 'lodash/fp';
import cosmiconfig from 'cosmiconfig';
import {createDebugger} from './debug';
import pkg from '../package.json';
import traverse from 'traverse';

const debug = createDebugger(module);

const ON = 'on';
const OFF = 'off';

const getExplorer = _.memoize(opts =>
  cosmiconfig(
    pkg.name,
    _.defaults(
      {
        loaders: {'.js': cosmiconfig.loadJs, noExt: cosmiconfig.loadJs}
      },
      opts
    )
  )
);

const search = async (fromDirpath, opts = {}) =>
  getExplorer(opts).search(fromDirpath);

const load = async (filepath, opts = {}) => getExplorer(opts).load(filepath);

const flattenConfig = configResult => {
  let config = {};
  if (configResult) {
    debug(`found file at ${configResult.filepath}`);
    config = {config: flatten(_.getOr({}, 'config.config', configResult))};
  }
  return config;
};

export const fromDir = async (fromDirpath, opts = {}) =>
  flattenConfig(await search(fromDirpath, opts));

export const fromFile = async (filepath, opts = {}) =>
  flattenConfig(await load(filepath, opts));

const normalize = obj =>
  traverse(obj).map(function(value) {
    if (_.isString(value)) {
      if (value === ON) {
        this.update(true);
      } else if (value === OFF) {
        this.update(false);
      }
    }
  });

const pushToConfigList = list => value =>
  list.push(normalize(_.omit('name', value)));

/**
 *
 * @param {Object} config - A config object
 * @param {Object[]} configObjects - Flattened config objects
 * @todo Configs must be validated against a config schema in a depth-first manner
 * @returns {Object} Flattened config
 */
export const flatten = (config, configObjects = []) => {
  const push = pushToConfigList(configObjects);
  const flattenValue = (value, idx = 0) => {
    if (_.isString(value)) {
      if (BUILTIN_CONFIGS.has(value)) {
        push(BUILTIN_CONFIGS.get(normalize(value)));
      } else {
        throw new Error(
          `unknown builtin config at position ${idx}: "${value}"`
        );
      }
    } else if (_.isObject(value)) {
      push(_.has('config', value) ? flattenValue(value, configObjects) : value);
    } else {
      throw new Error(`invalid config value: "${value}"`);
    }
  };

  if (_.isArray(config)) {
    config.forEach(flattenValue);
    return _.defaultsDeepAll(configObjects.reverse().concat({}));
  }

  return flattenValue(config);
};

const enabledRules = _.pipe(
  _.getOr({}, 'rules'),
  _.toPairs,
  _.reduce(
    (acc, [key, value]) =>
      (_.isArray(value) && value[0]) || value ? _.concat(acc, key) : acc,
    []
  )
);

export const findConfigs = config => {
  const ruleIds = enabledRules(config);
  return _.reduce(
    (acc, ruleId) =>
      _.assign(acc, {[ruleId]: _.getOr({}, `rules.${ruleId}`, config)}),
    {},
    ruleIds
  );
};
