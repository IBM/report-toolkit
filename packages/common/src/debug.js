import debug from 'debug';

import {NAMESPACE} from './constants.js';
import {tap} from './observable.js';
import {_} from './util.js';

const NAMESPACE_SEPARATOR = ':';
const APP_NAMESPACE = `${NAMESPACE}*`;

const joinDebugNamespace = _.join(NAMESPACE_SEPARATOR);

const getDebugNamespace = _.memoize((...args) =>
  joinDebugNamespace([NAMESPACE, ...args])
);

export const createDebugger = _.memoize(
  _.pipe(
    getDebugNamespace,
    debug
  )
);

export const enableDebugger = () => {
  debug.enable(APP_NAMESPACE);
};

export const createDebugPipe = (...args) => {
  const debug = createDebugger(...args);
  return (fn = _.identity) => observable =>
    observable.pipe(
      tap(value => {
        const msg = fn(value);
        if (msg) {
          debug(msg);
        }
      })
    );
};
