/**
 * A transformer which outputs newline-delimited output.  Can be used to output
 * newline-delimited JSON ("ndjson").
 * @module @report-toolkit/transformers.newline
 */
/**
 * do not remove this comment (for typedoc)
 */
import {_, observable} from '@report-toolkit/common';
import stringify from 'fast-safe-stringify';

const {concatMap, of} = observable;

/**
 * @type {TransformerMeta}
 */
export const meta = {
  defaults: /**
   * @type {NewlineTransformOptions}
   */ ({
    json: true
  }),
  description: 'Newline-delimited output',
  id: 'newline',
  input: ['string', 'object', 'number'],
  output: 'string'
};

/**
 * Newline parser; given whatever, output a string ending with newline (or `newline` of your choice)
 * @param {Partial<NewlineTransformOptions>} [opts]
 * @type {TransformFunction<any,string>}
 */
export const transform = ({json = meta.defaults.json} = {}) => observable =>
  observable.pipe(
    concatMap(value =>
      of(json || _.isObject(value) ? stringify(value) : String(value))
    )
  );

/**
 * @typedef {object} NewlineTransformOptions
 * @property {boolean} json - If true, force-stringify the value. Objects will always be stringified
 */

/**
 * @typedef {import('@report-toolkit/common').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 * @typedef {import('./transformer.js').TransformerField} TransformerField
 */
/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
