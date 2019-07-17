import debug from 'debug';

import {SHORT_NAMESPACE} from './constants.js';
import {tap} from './observable.js';
import {_} from './util.js';

const NAMESPACE_SEPARATOR = ':';
const APP_NAMESPACE = `${SHORT_NAMESPACE}*`;

const joinDebugNamespace = _.join(NAMESPACE_SEPARATOR);

const getDebugNamespace = (...args) =>
  joinDebugNamespace([SHORT_NAMESPACE, ...args]);

export const createDebugger = _.pipe(
  getDebugNamespace,
  debug
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
