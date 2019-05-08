import * as observable from './observable';

import {createDebugger} from '../debug';
import {toArray} from 'rxjs/operators';

export const debug = createDebugger(module);

export const inspect = async (...args) =>
  observable
    .inspect(...args)
    .pipe(toArray())
    .toPromise();

export const loadConfig = async (...args) =>
  observable.loadConfig(...args).toPromise();

export const loadRules = async (...args) =>
  observable
    .loadRules(...args)
    .pipe(toArray())
    .toPromise();

export const diff = async (...args) =>
  observable
    .diff(...args)
    .pipe(toArray())
    .toPromise();

export const readReports = async (...args) =>
  observable.readReports(...args).toPromise();

export {observable};
