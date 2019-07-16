// @ts-check

import {_, observable} from '@report-toolkit/common';
import hashjs from 'hash.js';

const {map} = observable;
const DEFAULT_STRIP_REGEXP = /[0-9]+/g;

/**
 * Given a report, generate a SHA1 hash of the stack trace. Useful
 * when determining whether a stack trace is new or already known.
 * @param {Object} [opts] - Options
 * @param {RegExp|Function|string} [opts.strip] - Strips anything matching this RegExp or string from the `javascriptStack.message` prop.  If function, used as a projector.
 * @returns {import('rxjs/internal/types').OperatorFunction<import('@report-toolkit/report').Report,{dumpEventTime:string,filename?:string,hash:string,message:string}>}
 */
export const toStackHash = ({
  strip = DEFAULT_STRIP_REGEXP
} = {}) => observable =>
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
        hash: hashjs
          .sha1()
          .update(`${strippedMessage}${stack.join(',')}`)
          .digest('hex'),
        message: strippedMessage
      };
    })
  );
