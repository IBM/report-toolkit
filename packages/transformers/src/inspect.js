import {inspectReports} from '@report-toolkit/inspector';

/**
 * @type {TransformerMeta}
 */
export const meta = {
  description: 'Inspect report for problems',
  input: ['report'],
  name: 'inspect',
  output: 'object'
};

export const transform = (reports, opts = {}) => observable =>
  observable.pipe(inspectReports(reports, opts));

/**
 * @typedef {import('@report-toolkit/report').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 */

/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
/**
 * @template T
 * @typedef {import('rxjs').Observable<T>} Observable
 */
