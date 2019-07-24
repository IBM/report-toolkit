import {_, observable} from '@report-toolkit/common';
import {AsyncParser} from 'json2csv';

const {concatMapTo, finalize, fromEvent, map, takeUntil, tap} = observable;

/**
 * @type {TransformerMeta}
 */
export const meta = {
  description: 'Comma-separated values',
  id: 'csv',
  input: ['string', 'object', 'report'],
  output: 'string'
};

/**
 * CSV transformer; accepts whatever json2csv can handle
 * @see https://npm.im/json2csv
 * @param {CSVTransformOptions} [parserOpts]
 * @returns {TransformFunction<string|object,CSVTransformResult>}
 */
export const transform = (parserOpts = {}) => observable => {
  const parser = new AsyncParser(parserOpts, {
    objectMode: true
  });
  return observable.pipe(
    finalize(() => {
      parser.input.push(null);
    }),
    tap(row => {
      parser.input.push(row);
    }),
    concatMapTo(fromEvent(parser.processor, 'data')),
    takeUntil(fromEvent(parser.processor, 'end')),
    map(_.trimEnd)
  );
};

/**
 * This is a single CSV-formatted row
 * @typedef {string} CSVTransformResult
 */
/**
 * Options for AsyncParser
 * @typedef {object} CSVTransformOptions
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
