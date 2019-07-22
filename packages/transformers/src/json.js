import {observable} from '@report-toolkit/common';
import stringify from 'fast-safe-stringify';

const {map, toArray} = observable;

/**
 * @type {TransformerMeta}
 */
export const meta = {
  description: 'JSON',
  input: ['string', 'object', 'number', 'report'],
  name: 'json',
  output: 'string'
};

/**
 * Emits a single JSON blob.
 * @type {TransformFunction<object,string>}
 * @param {{pretty?: boolean}} [opts]
 */
export const transform = ({pretty = false} = {}) => observable =>
  observable.pipe(
    toArray(),
    map(
      pretty
        ? values => stringify(values, null, 2)
        : values => stringify(values)
    )
  );

/**
 * @typedef {import('@report-toolkit/report').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 */
/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
