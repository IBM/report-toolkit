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

export const createDebugger = _.pipe(
  getDebugNamespace,
  debug
);

/**
 * Enables entire debug namespace for this module
 */
export const enableDebugger = () => {
  debug.enable(APP_NAMESPACE);
};

/**
 * @param {string[]} args
 */
export const createDebugPipe = (...args) => {
  const debug = createDebugger(...args);

  return (
    /**
     * @param {(...args: any[]) => string|any[]} fn
     * @returns {import('rxjs').OperatorFunction<any,any>}
     */
    fn => observable =>
      observable.pipe(
        tap(value => {
          /**
           * @type {any[]}
           */
          const msg = _.castArray(fn(value));
          if (msg.length) {
            // @ts-ignore
            debug(...msg);
          }
        })
      )
  );
};
