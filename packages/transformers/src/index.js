import {toNumeric} from './numeric.js';
import {toRedactedReport} from './redact.js';
import {toStackHash} from './stack-hash.js';

/**
 * Object containing all built-in transformers
 */
export const transformers = {
  numeric: toNumeric,
  redact: toRedactedReport,
  'stack-hash': toStackHash
};
export const constants = Object.freeze({
  TRANSFORMER_NUMERIC: 'numeric',
  TRANSFORMER_REDACT: 'redact',
  TRANSFORMER_STACK_HASH: 'stack-hash'
});
