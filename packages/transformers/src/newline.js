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
    json: false,
    newline: '\n'
  }),
  description: 'Newline-delimited output',
  id: 'newline',
  input: ['string', 'object', 'number'],
  output: 'string'
};

/**
 * Newline parser; given whatever, output a string ending with newline (or `newline` of your choice)
 * @param {Partial<NewlineTransformOptions>} [opts]
 * @returns {TransformFunction<any,string>}
 */
export const transform = ({json, newline} = {}) => observable =>
  observable.pipe(
    concatMap(value =>
      of(
        (json || _.isObject(value) ? stringify(value) : String(value)) + newline
      )
    )
  );

/**
 * @typedef {object} NewlineTransformOptions
 * @property {boolean} json - If true, stringify the value
 * @property {string} newline - Whatever you consider a newline to be. Maybe \r\n?
 */

/**
 * @typedef {import('@report-toolkit/report').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 * @typedef {import('./transformer.js').TransformerField} TransformerField
 */
/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
