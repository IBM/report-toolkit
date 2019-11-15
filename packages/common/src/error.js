/**
 * Represents a "known" Error
 */
export class RTkError extends Error {
  /**
   * Assigns custom props
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {Partial<RTkErrorOptions>} [opts] - Options
   */
  constructor(message, code, opts = {}) {
    super(message);

    this.code = code;

    const {data, url} = opts;
    this.data = data;
    this.url = url;
  }

  /**
   * Create a RTkError
   * @param {string} [code] - Error code
   * @param {string} [message] - Error message
   * @param {Partial<RTkErrorOptions>} opts - Options
   */
  static create(
    code = RTKERR_UNKNOWN_ERROR,
    message = '(unknown error)',
    opts = {}
  ) {
    return new RTkError(message, code, opts);
  }
}

export const RTKERR_INVALID_CLI_OPTION = 'RTKERR_INVALID_CLI_OPTION';
export const RTKERR_INVALID_CONFIG = 'RTKERR_INVALID_CONFIG';
export const RTKERR_INVALID_PARAMETER = 'RTKERR_INVALID_PARAMETER';
export const RTKERR_INVALID_REPORT = 'RTKERR_INVALID_REPORT';
export const RTKERR_INVALID_RULE_CONFIG = 'RTKERR_INVALID_RULE_CONFIG';
export const RTKERR_INVALID_RULE_DEFINITION = 'RTKERR_INVALID_RULE_DEFINITION';
export const RTKERR_INVALID_SCHEMA = 'RTKERR_INVALID_SCHEMA';
export const RTKERR_INVALID_TRANSFORMER_HEAD =
  'RTKERR_INVALID_TRANSFORMER_HEAD';
export const RTKERR_INVALID_TRANSFORMER_PIPE =
  'RTKERR_INVALID_TRANSFORMER_PIPE';
export const RTKERR_INVALID_TRANSFORMER_TAIL =
  'RTKERR_INVALID_TRANSFORMER_TAIL';
export const RTKERR_MISSING_CONFIG = 'RTKERR_MISSING_CONFIG';
export const RTKERR_RULE_NAME_COLLISION = 'RTKERR_RULE_NAME_COLLISION';
export const RTKERR_UNKNOWN_BUILTIN_CONFIG = 'RTKERR_UNKNOWN_BUILTIN_CONFIG';
export const RTKERR_UNKNOWN_ERROR = 'RTKERR_UNKNOWN_ERROR';
export const RTKERR_UNKNOWN_TRANSFORMER = 'RTKERR_UNKNOWN_TRANSFORMER';

export const createRTkError = RTkError.create;

/**
 * @typedef {object} RTkErrorOptions
 * @property {any} data - Extra data
 * @property {string} url - URL for more information
 */
