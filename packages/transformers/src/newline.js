import {_, observable} from '@report-toolkit/common';
import stringify from 'fast-safe-stringify';

const {concatMap, of} = observable;

export const meta = {
  description: 'Newline-delimited output',
  input: ['string', 'object', 'number'],
  name: 'newline',
  output: 'string'
};

/**
 *
 * @param {{ndjson?: boolean, newline?: string}} [opts]
 * @type TransformFunction<any,string>
 */
export const transform = ({
  ndjson = false,
  newline = '\n'
} = {}) => observable =>
  observable.pipe(
    concatMap(value =>
      of(
        (ndjson || _.isObject(value) ? stringify(value) : String(value)) +
          newline
      )
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
