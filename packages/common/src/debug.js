import debug from 'debug';

import {SHORT_NAMESPACE} from './constants.js';
import {tap} from './observable.js';
import {_} from './util.js';

const NAMESPACE_SEPARATOR = ':';
const APP_NAMESPACE = `${SHORT_NAMESPACE}*`;

const joinDebugNamespace = _.join(NAMESPACE_SEPARATOR);

/**
 * Returns a namespace for debug pkg
 * @param {string[]} args Strings to append to debug namespace
 */
const getDebugNamespace = (...args) =>
  joinDebugNamespace([SHORT_NAMESPACE, ...args]);

/**
 * Creates a `Debugger` instance with proper namespace
 * @see https://npm.im/debug
 * @param {string[]} args
 */
export const createDebugger = (...args) =>
  _.pipe(
    getDebugNamespace,
    debug
  )(...args);

/**
 * Enables entire debug namespace for this module. Calling this is just like
 * setting `DEBUG=RTK*` in the environment.
 */
export const enableDebugger = () => {
  debug.enable(APP_NAMESPACE);
};

/**
 * Creates an RxJS debug "operator" using the supplied namespace(s). The
 * resulting operator is essentially like
 * [tap](https://rxjs.dev/api/operators/tap), except whatever is returned is
 * handed to a `Debugger` instance. The resulting operator accepts a single
 * function which receives a value from the source `Observable`. You can return
 * an array of values to make use `Debugger`'s sprintf-style formatting.
 * @param {string[]} args - Zero or more namespace tokens
 */
export const createDebugPipe = (...args) => {
  const debug = createDebugger(...args);

  return (
    /**
     * @template T
     * @param {(arg: T) => any} fn
     * @returns {import('rxjs').OperatorFunction<T,T>}
     */
    fn => observable =>
      observable.pipe(
        tap(value => {
          /**
           * @type {any[]}
           */
          const msg = _.castArray(fn(value));
          if (msg.length) {
            debug.apply(null, msg);
          }
        })
      )
  );
};
