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
    code = REPORT_TOOLKIT_ERR_UNKNOWN_ERROR,
    message = '(unknown error)',
    {data, url} = {}
  ) {
    return new RTkError(message, code, {data, url});
  }
}
export const REPORT_TOOLKIT_ERR_UNKNOWN_ERROR =
  'REPORT_TOOLKIT_ERR_UNKNOWN_ERROR';
export const REPORT_TOOLKIT_ERR_INVALID_CLI_OPTION =
  'REPORT_TOOLKIT_ERR_INVALID_CLI_OPTION';
export const REPORT_TOOLKIT_ERR_INVALID_REPORT =
  'REPORT_TOOLKIT_ERR_INVALID_REPORT';
export const REPORT_TOOLKIT_ERR_INVALID_SCHEMA =
  'REPORT_TOOLKIT_ERR_INVALID_SCHEMA';
export const REPORT_TOOLKIT_ERR_INVALID_RULE_CONFIG =
  'REPORT_TOOLKIT_ERR_INVALID_RULE_CONFIG';
export const REPORT_TOOLKIT_ERR_UNKNOWN_BUILTIN_CONFIG =
  'REPORT_TOOLKIT_ERR_UNKNOWN_BUILTIN_CONFIG';
export const REPORT_TOOLKIT_ERR_INVALID_PARAMETER =
  'REPORT_TOOLKIT_ERR_INVALID_PARAMETER';
export const REPORT_TOOLKIT_ERR_INVALID_CONFIG =
  'REPORT_TOOLKIT_ERR_INVALID_CONFIG';
export const REPORT_TOOLKIT_ERR_MISSING_CONFIG =
  'REPORT_TOOLKIT_ERR_MISSING_CONFIG';
export const REPORT_TOOLKIT_ERR_INVALID_RULE_DEFINITION =
  'REPORT_TOOLKIT_ERR_INVALID_RULE_DEFINITION';

export const createRTkError = RTkError.create;
