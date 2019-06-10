import * as stream from './stream';

import {createDebugger} from '../debug';
import {toArray} from '../observable';

export const debug = createDebugger(module);

export const inspect = async (...args) =>
  stream
    .inspect(...args)
    .pipe(toArray())
    .toPromise();

export const loadConfig = async (...args) =>
  stream.loadConfig(...args).toPromise();

export const loadRules = async (...args) =>
  stream
    .loadRules(...args)
    .pipe(toArray())
    .toPromise();

export const diff = async (...args) =>
  stream
    .diff(...args)
    .pipe(toArray())
    .toPromise();

export const loadReport = async (...args) =>
  stream.loadReport(...args).toPromise();

export const loadRuleConfigs = async (...args) =>
  stream.loadRuleConfigs(...args).toPromise();
