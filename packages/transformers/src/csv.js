import {_, observable} from '@report-toolkit/common';
import {AsyncParser} from 'json2csv';
import stripAnsi from 'strip-ansi';
const {
  filter,
  concatMapTo,
  finalize,
  fromEvent,
  map,
  takeUntil,
  tap
} = observable;

/**
 * @type {TransformerMeta}
 */
export const meta = {
  description: 'Comma-separated values',
  id: 'csv',
  input: ['object', 'report'],
  output: 'string'
};

/**
 * CSV transformer; accepts whatever json2csv can handle
 * @see https://npm.im/json2csv
 * @param {CSVTransformOptions} [parserOpts]
 * @type {TransformFunction<string|object,CSVTransformResult>}
 */
export const transform = (parserOpts = {}) => observable => {
  // XXX: the parser wants to add a newline to everything we push to it for
  // some reason. likely "user error"
  const parser = new AsyncParser(
    {...parserOpts, eol: ''},
    {
      objectMode: true
    }
  );
  return observable.pipe(
    finalize(() => {
      parser.input.push(null);
    }),
    tap(row => {
      parser.input.push(row);
    }),
    concatMapTo(fromEvent(parser.processor, 'data')),
    takeUntil(fromEvent(parser.processor, 'end')),
    filter(Boolean),
    map(
      _.pipe(
        _.trim,
        stripAnsi
      )
    )
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
 * @typedef {import('@report-toolkit/common').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 * @typedef {import('./transformer.js').TransformerField} TransformerField
 */
/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
