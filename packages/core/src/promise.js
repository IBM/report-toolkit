import {toArray} from '@gnostic/common/src/observable.js';

import * as stream from './stream.js';

export const inspect = async (...args) =>
  stream
    .inspect(...args)
    .pipe(toArray())
    .toPromise();

export const diff = async (...args) =>
  stream
    .diff(...args)
    .pipe(toArray())
    .toPromise();
