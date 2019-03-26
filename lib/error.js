export class GnosticError extends Error {
  /**
   * Calls parent class and assigns `code` prop.
   * @param {string} [message] - Error message
   * @param {string} [code] - Error code
   * @param {*} [data] - Extra data
   */
  constructor(message, code, data = {}) {
    super(message);

    /**
     * @type string
     */
    this.code = code;

    /**
     * @type *
     */
    this.data = data;
  }
}

export const GnosticErrorCodes = {
  GNOSTIC_ERR_INVALID_ARG: 'GNOSTIC_ERR_INVALID_ARG',
  GNOSTIC_ERR_INVALID_REPORT: 'GNOSTIC_ERR_INVALID_REPORT'
};
