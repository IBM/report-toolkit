import {toNumeric} from './numeric.js';
import {toStackHash} from './stack-hash.js';

/**
 * Object containing all built-in transformers
 */
export const transformers = {
  numeric: toNumeric,
  'stack-hash': toStackHash
};
export const constants = Object.freeze({
  TRANSFORMER_NUMERIC: 'numeric',
  TRANSFORMER_STACK_HASH: 'stack-hash'
});
