import {REDACTED_TOKEN} from './constants.js';
import {kRedacted} from './symbols.js';
import {_, coerceToArray} from './util.js';

const AWS_STR = '(AWS|aws|Aws)?_?';
const QUOTE_STR = '("|\')';
const CONNECT_STR = 's*(:|=>|=)s*';
const OPT_QUOTE_STR = `${QUOTE_STR}?`;

const DEFAULT_WHITELIST = new Set(['sharedObjects']);
const SECRETS = [
  /passw(or)?d/i,
  /^pw$/,
  /^pass$/i,
  /secret/i,
  /token/i,
  /api[-._]?key/i,
  /session[-._]?id/i,
  /access[-._]?key/i,
  /private/i,

  // express
  /^connect\.sid$/,

  // AWS
  /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
  new RegExp(
    `${OPT_QUOTE_STR}${AWS_STR}(SECRET|secret|Secret)?_?(ACCESS|access|Access)?_?(KEY|key|Key)${OPT_QUOTE_STR}${CONNECT_STR}${OPT_QUOTE_STR}[A-Za-z0-9/+=]{40}${OPT_QUOTE_STR}`
  ),
  new RegExp(
    `${OPT_QUOTE_STR}${AWS_STR}(ACCOUNT|account|Account)_?(ID|id|Id)?${OPT_QUOTE_STR}${CONNECT_STR}${OPT_QUOTE_STR}[0-9]{4}-?[0-9]{4}-?[0-9]{4}${OPT_QUOTE_STR}`
  )
];

const isSecret = (secrets, value, key) =>
  _.some(matcher => {
    return _.isString(matcher)
      ? key === matcher || value === matcher
      : matcher.test(key) || matcher.test(value);
  }, secrets);

/**
 * Recursively redacts strings from a value based on key matching. Does not
 * mutate `obj`. Returned value will have a `kRedacted` Symbol key set to
 * `true`. Unless option `force` is `true`, any `obj` having this root property
 * will be returned w/o modification.
 * @param {T} obj - Object whose string values may be redacted
 * @param {Object} [opts] - Options
 * @param {string|string[]|RegExp|RegExp[]} [opts.match] - Also redact these
 * keypaths (e.g., `header.cwd`) or matching values. A matching keypath will
 * redact all children; if the value of `match` is `header`, _everything_ in the
 * report's `header` prop will be redacted.
 * @param {Set<string>} [opts.whitelist=['sharedObjects']] - Whitelist these keypaths from redaction
 * @param {boolean} [opts.force] - If `true`, redact an already-redacted object
 * (one which has `[kRedacted]: true` root prop)
 * @returns {T} `obj` with potentially redacted values
 * @see https://npm.im/traverse
 */
export const redact = (obj, opts = {}) => {
  let {force, match, whitelist} = _.defaults(
    {force: false, match: [], whitelist: DEFAULT_WHITELIST},
    opts
  );

  if (!force && kRedacted in obj) {
    return obj;
  }

  // coerce these to array for easier processing
  match = coerceToArray(match);

  const secrets = _.uniq([...match, ...SECRETS]);

  return {
    // NOTE: this is NOT `Array.prototype.map`
    ..._.traverse(obj).map(function(value) {
      // potential optimization: keys whose keypaths are longer than the current
      // path will never match, so we could disregard them if we pre-processed
      // the `keys` array further
      const keypath = this.path.join('.');
      if (
        keypath &&
        !whitelist.has(keypath) &&
        isSecret(secrets, value, keypath)
      ) {
        this.update(REDACTED_TOKEN);
      }
    }),
    [kRedacted]: true
  };
};

export {SECRETS};
