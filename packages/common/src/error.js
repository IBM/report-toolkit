export class RTkError extends Error {
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

  /**
   * Create a RTkError
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {Object} [opts] - Options
   * @param {any} [opts.data] - Anything
   * @param {string} [opts.url] - URL for more info
   */
  static create(
    code = RTKERR_UNKNOWN_ERROR,
    message = '(unknown error)',
    {data, url} = {}
  ) {
    return new RTkError(message, code, {data, url});
  }
}
export const RTKERR_UNKNOWN_ERROR = 'RTKERR_UNKNOWN_ERROR';
export const RTKERR_INVALID_CLI_OPTION = 'RTKERR_INVALID_CLI_OPTION';
export const RTKERR_INVALID_REPORT = 'RTKERR_INVALID_REPORT';
export const RTKERR_INVALID_SCHEMA = 'RTKERR_INVALID_SCHEMA';
export const RTKERR_INVALID_RULE_CONFIG = 'RTKERR_INVALID_RULE_CONFIG';
export const RTKERR_UNKNOWN_BUILTIN_CONFIG = 'RTKERR_UNKNOWN_BUILTIN_CONFIG';
export const RTKERR_INVALID_PARAMETER = 'RTKERR_INVALID_PARAMETER';
export const RTKERR_INVALID_CONFIG = 'RTKERR_INVALID_CONFIG';
export const RTKERR_MISSING_CONFIG = 'RTKERR_MISSING_CONFIG';
export const RTKERR_INVALID_RULE_DEFINITION = 'RTKERR_INVALID_RULE_DEFINITION';
export const RTKERR_UNKNOWN_TRANSFORMER = 'RTKERR_UNKNOWN_TRANSFORMER';
export const RTKERR_INVALID_TRANSFORMER_HEAD =
  'RTKERR_INVALID_TRANSFORMER_HEAD';
export const RTKERR_INVALID_TRANSFORMER_TAIL =
  'RTKERR_INVALID_TRANSFORMER_TAIL';
export const RTKERR_INVALID_TRANSFORMER_PIPE =
  'RTKERR_INVALID_TRANSFORMER_PIPE';
export const RTKERR_RULE_NAME_COLLISION = 'RTKERR_RULE_NAME_COLLISION';

export const createRTkError = RTkError.create;
