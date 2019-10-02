/**
 * Transformer which redacts secrets from a {@link Report}. This transformer is
 * _always_ run unless the user explicitly disables it.
 * @module @report-toolkit/transformers.redact
 */
/**
 * do not remove this comment (for typedoc)
 */
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
 * @typedef {import('@report-toolkit/common').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 */

/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
