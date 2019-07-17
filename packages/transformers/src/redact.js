// @ts-check

import {observable, redact} from '@report-toolkit/common';

import {createTransformer} from './transformer.js';

const {map} = observable;

/**
 * @typedef {import('@report-toolkit/report').Report} Report
 */

/**
 * @template T
 * @typedef {import('./transformer.js').TransformFunction<T>} TransformFunction
 * @typedef {import('./transformer.js').Transformer} Transformer
 */

/**
 * @type {Transformer<Report>}
 */
export const toRedactedReport = createTransformer(
  (opts = {}) => observable =>
    observable.pipe(map(report => redact(report, opts))),
  {allowedFormats: 'json'}
);
