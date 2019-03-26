import debug from 'debug';
import pkg from '../package.json';

export const createDebugger = name => debug(`${pkg.name}:${name}`);
export const enableDebugger = () => debug.enable(`${pkg.name}*`);
