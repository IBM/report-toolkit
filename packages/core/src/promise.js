import {observable} from '@gnostic/common';

import * as stream from './stream.js';

const {toArray} = observable;

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
