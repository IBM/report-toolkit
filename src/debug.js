import {basename, dirname, relative, resolve, sep} from 'path';

import debug from 'debug';
import pkg from '../package.json';

const NAMESPACE_SEPARATOR = ':';
const APP_NAMESPACE = `${pkg.name}*`;

const getModuleId = module => {
  const relpath = relative(resolve(__dirname, '..'), module.id);
  const moduleName = basename(relpath, '.js');
  const dirName = dirname(relpath)
    .split(sep)
    .slice(1)
    .join(sep);
  return dirName ? `${dirName}/${moduleName}` : moduleName;
};

export const createDebugger = (module, ...extra) => {
  const moduleId = getModuleId(module);
  const id = [pkg.name, moduleId, ...extra].join(NAMESPACE_SEPARATOR);
  return debug(id);
};

export const enableDebugger = () => {
  debug.enable(APP_NAMESPACE);
};

export const isDebugEnabled = module => debug.enabled(getModuleId(module));
