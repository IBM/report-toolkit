import {observable} from '@report-toolkit/common';

import * as stream from './stream.js';

const {toArray} = observable;

export const diff = async (...args) =>
  stream
    .diff(...args)
    .pipe(toArray())
    .toPromise();
