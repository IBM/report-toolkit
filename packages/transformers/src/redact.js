import {observable, redact} from '@report-toolkit/common';

const {map} = observable;

/**
 * @type {TransformerMeta}
 */
export const meta = {
  description: 'Redact secrets from a report',
  id: 'redact',
  input: ['report'],
  output: 'report'
};

/**
 * @type {TransformFunction<Report,Report>}
 */
export const transform = (opts = {}) => observable =>
  observable.pipe(map(report => redact(report, opts)));

/**
 * @typedef {import('@report-toolkit/report').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 */

/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
