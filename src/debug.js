import {basename, join, relative} from 'path';

import debug from 'debug';
import pkg from '../package.json';

const NAMESPACE_SEPARATOR = ':';

const getModuleId = module =>
  basename(relative(join(__dirname, '..'), module.id), '.js');

export const createDebugger = module => {
  const moduleId = getModuleId(module);
  return debug([pkg.name, moduleId].join(NAMESPACE_SEPARATOR));
};

export const enableDebugger = (module, extra = '') => {
  const moduleId = getModuleId(module);
  debug.enable(`${[pkg.name, moduleId].join(NAMESPACE_SEPARATOR)}${extra}`);
};
