import {BUILTIN_CONFIGS} from '../config/index';
import _ from 'lodash';
import cosmiconfig from 'cosmiconfig';
import pkg from '../package.json';

const getExplorer = _.memoize(opts =>
  cosmiconfig(
    pkg.name,
    _.defaults(opts, {
      loaders: {'.js': cosmiconfig.loadJs, noExt: cosmiconfig.loadJs}
    })
  )
);

export const search = (fromDirpath, opts = {}) =>
  getExplorer(opts).search(fromDirpath);

const pushToConfigList = list => value => list.push(_.omit(value, 'name'));

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
        _.has(value, 'config')
          ? flattenConfig(value, configObjects, breadcrumbs.concat(idx))
          : value
      );
    } else {
      throw new Error(`invalid config value via ${breadcrumbs}: "${value}"`);
    }
  };

  if (_.isArray(config)) {
    config.forEach(flatten);
    return _.defaultsDeep({}, ...configObjects.reverse());
  }

  return flatten(config);
};
