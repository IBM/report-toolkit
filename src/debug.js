import debug from 'debug';
import pkg from '../package.json';

export const createDebugger = name => debug(`${pkg.name}:${name}`);
export const enableDebugger = (namespace = '') => {
  debug.enable(`${pkg.name}${namespace}*`);
};
