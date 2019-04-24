import {BUILTIN_CONFIGS} from '../config/index';
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

const pushToConfigList = list => value => list.push(_.omit('name', value));

const normalizeValue = obj =>
  traverse(obj).map(function(value) {
    if (_.isString(value)) {
      if (value === ON) {
        this.update(true);
      } else if (value === OFF) {
        this.update(false);
      }
    }
  });

export const flatten = (config, configObjects = [], breadcrumbs = []) => {
  const push = pushToConfigList(configObjects);
  const flatten = (value, idx = 0) => {
    if (_.isString(value)) {
      if (BUILTIN_CONFIGS.has(value)) {
        push(BUILTIN_CONFIGS.get(value));
      } else {
        throw new Error(
          `unknown builtin config at position ${idx} via ${breadcrumbs}: "${value}"`
        );
      }
    } else if (_.isObject(value)) {
      push(
        _.has('config', value)
          ? flatten(value, configObjects, breadcrumbs.concat(idx))
          : normalizeValue(value)
      );
    } else {
      throw new Error(`invalid config value via ${breadcrumbs}: "${value}"`);
    }
  };

  if (_.isArray(config)) {
    config.forEach(flatten);
    return _.defaultsDeepAll(configObjects.reverse());
  }

  return flatten(config);
};

export const enabledRules = _.pipe(
  _.getOr({}, 'rules'),
  _.toPairs,
  _.reduce(
    (acc, [key, value]) =>
      (_.isArray(value) && value[0]) || value ? _.concat(acc, key) : acc,
    []
  )
);
