// @ts-check

import {_, observable} from '@report-toolkit/common';
import hashjs from 'hash.js';

import {createTransformer} from './transformer.js';

const {map} = observable;
const DEFAULT_STRIP_REGEXP = /[0-9]+/g;

/**
 * @typedef {{dumpEventTime:string,filename?:string,sha1:string,message:string}} StackHashResult
 */

/**
 * @template T
 * @typedef {import('./transformer.js').TransformFunction<T>} TransformFunction
 * @typedef {import('./transformer.js').Transformer} Transformer
 */

/**
 * A Transformer which extracts JavaScript stacks from a Report and assigns
 * unique SHA1 hash identifiers.
 * @type {Transformer<StackHashResult>}
 */
export const toStackHash = createTransformer(
  /**
   * Given a report, generate a SHA1 hash of the stack trace. Useful when
   * determining whether a stack trace is new or already known.
   * @param {Object} [opts] - Options
   * @param {RegExp|Function|string} [opts.strip] - Strips anything matching
   * this RegExp or string from the `javascriptStack.message` prop.  If
   * function, used as a projector.
   */
  ({strip = DEFAULT_STRIP_REGEXP} = {}) => observable =>
    observable.pipe(
      map(report => {
        // @ts-ignore
        const {dumpEventTime, filename} = report.header;
        // @ts-ignore
        const {message, stack} = report.javascriptStack;
        const strippedMessage = _.isFunction(strip)
          ? strip(message)
          : message.replace(strip, '');
        return {
          dumpEventTime,
          filename,
          message: strippedMessage,
          sha1: hashjs
            .sha1()
            .update(`${strippedMessage}${stack.join(',')}`)
            .digest('hex')
        };
      })
    ),
  {
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
        value: 'filename'
      },
      {label: 'Error', value: 'message'}
    ]
  }
);
