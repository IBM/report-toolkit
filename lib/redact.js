import traverse from 'traverse';

const AWS_STR = '(AWS|aws|Aws)?_?';
const QUOTE_STR = '("|\')';
const CONNECT_STR = 's*(:|=>|=)s*';
const OPT_QUOTE_STR = `${QUOTE_STR}?`;
export const REDACTED = '[REDACTED]';

export const SECRETS = [
  /passw(or)?d/i,
  /^pw$/,
  /^pass$/i,
  /secret/i,
  /token\b/i,
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

/**
 * Recursively redacts strings from a value based on key matching.
 * Does not mutate `obj`.  Or at least that's the idea.
 * @param {T} obj - Object whose string values may be redacted
 * @returns {T} `obj` with potentially redacted values
 */
export const redact = obj =>
  traverse(obj).map(function(value) {
    if (SECRETS.some(regex => regex.test(this.key) || regex.test(value))) {
      this.update(REDACTED);
    }
  });
