import {BUILTIN_CONFIGS} from '../config/index';
import _ from 'lodash/fp';
import cosmiconfig from 'cosmiconfig';
import pkg from '../package.json';
import traverse from 'traverse';

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

export const search = (fromDirpath, opts = {}) =>
  getExplorer(opts).search(fromDirpath);

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

export const flattenConfig = (config, configObjects = [], breadcrumbs = []) => {
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
          ? flattenConfig(value, configObjects, breadcrumbs.concat(idx))
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
