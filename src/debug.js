import {basename, join, relative} from 'path';

import debug from 'debug';
import pkg from '../package.json';

const NAMESPACE_SEPARATOR = ':';

const getModuleId = module =>
  basename(relative(join(__dirname, '..'), module.id), '.js');

export const createDebugger = (module, ...extra) => {
  const moduleId = getModuleId(module);
  const id = [pkg.name, moduleId, ...extra].join(NAMESPACE_SEPARATOR);
  return debug(id);
};

export const enableDebugger = () => {
  debug.enable(`${pkg.name}*`);
};
