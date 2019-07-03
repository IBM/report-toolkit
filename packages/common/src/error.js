export class GnosticError extends Error {
  /**
   * Calls parent class and assigns `code` prop.
   * @param {string} [message] - Error message
   * @param {string} [code] - Error code
   * @param {Object} [opts] - Options
   * @param {*} [opts.data] - Extra data
   * @param {string} [opts.url] - URL to link to, if any
   */
  constructor(message, code, {data, url} = {}) {
    super(message);

    /**
     * @type string
     */
    this.code = code;

    /**
     * @type *
     */
    this.data = data;

    /**
     * @type string
     */
    this.url = url;
  }

  static create(
    code = GNOSTIC_ERR_UNKNOWN_ERROR,
    message = '(unknown error)',
    {data, url} = {}
  ) {
    return new GnosticError(message, code, {data, url});
  }
}
export const GNOSTIC_ERR_UNKNOWN_ERROR = 'GNOSTIC_ERR_UNKNOWN_ERROR';
export const GNOSTIC_ERR_INVALID_CLI_OPTION = 'GNOSTIC_ERR_INVALID_CLI_OPTION';
export const GNOSTIC_ERR_INVALID_REPORT = 'GNOSTIC_ERR_INVALID_REPORT';
export const GNOSTIC_ERR_INVALID_SCHEMA = 'GNOSTIC_ERR_INVALID_SCHEMA';
export const GNOSTIC_ERR_INVALID_RULE_CONFIG =
  'GNOSTIC_ERR_INVALID_RULE_CONFIG';
export const GNOSTIC_ERR_UNKNOWN_BUILTIN_CONFIG =
  'GNOSTIC_ERR_UNKNOWN_BUILTIN_CONFIG';
export const GNOSTIC_ERR_INVALID_PARAMETER = 'GNOSTIC_ERR_INVALID_PARAMETER';
export const GNOSTIC_ERR_INVALID_CONFIG = 'GNOSTIC_ERR_INVALID_CONFIG';
export const GNOSTIC_ERR_MISSING_CONFIG = 'GNOSTIC_ERR_MISSING_CONFIG';
export const GNOSTIC_ERR_INVALID_RULE_DEFINITION =
  'GNOSTIC_ERR_INVALID_RULE_DEFINITION';

export const createGnosticError = GnosticError.create;
