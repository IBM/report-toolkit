/**
 * @module @report-toolkit/transformers.stack-hash
 */
/**
 * do not remove this comment (for typedoc)
 */
import {_, observable} from '@report-toolkit/common';
import hashjs from 'hash.js';

const {map} = observable;

/**
 * @type {TransformerMeta}
 */
export const meta = {
  defaults: /** @type {StackHashTransformOptions} */ ({
    fields: [
      {
        label: 'SHA1',
        value: 'sha1'
      },
      {
        label: 'Time',
        value: 'dumpEventTime'
      },
      {
        label: 'File',
        value: 'filepath'
      },
      {label: 'Error', value: 'message'},
      {label: 'Stack', value: 'stack'}
    ],
    strip: /[0-9]+/g
  }),
  description: 'Generate unique hash for JS stack trace',
  id: 'stack-hash',
  input: ['report'],
  output: 'object'
};

/**
 * Given a report, generate a SHA1 hash of the stack trace. Useful when
 * determining whether a stack trace is new or already known.
 * @param {Partial<StackHashTransformOptions>} [opts] - Options
 * @type {TransformFunction<Report,StackHashTransformResult>}
 */
export const transform = ({strip} = {}) => observable =>
  observable.pipe(
    map(report => {
      // @ts-ignore
      const {dumpEventTime} = report.header;
      const {filepath} = report;
      // @ts-ignore
      const {message, stack} = report.javascriptStack;
      const strippedMessage = _.isFunction(strip)
        ? /** @type {((arg: string) => string)} */ (strip)(message)
        : message.replace(strip, '');
      return {
        dumpEventTime,
        filepath,
        message: strippedMessage,
        sha1: hashjs
          .sha1()
          .update(`${strippedMessage}${stack.join(',')}`)
          .digest('hex'),
        stack
      };
    })
  );

/**
 * @typedef {{dumpEventTime:string,filename?:string,sha1:string,message:string}} StackHashTransformResult
 * @typedef {{fields: TransformerField[], strip: RegExp|function(string):string|string}} StackHashTransformOptions
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
