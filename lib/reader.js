import {GnosticError, GnosticErrorCodes} from './error';

import fs from 'fs';
import {getPolyfill} from 'util.promisify';

const promisify = getPolyfill();
const readFile = promisify(fs.readFile);

/**
 * A glorified async JSON parser
 * @todo validation
 * @param {string} filepath - Path to report JSON
 * @returns Promise<*> Parsed JSON object
 */
export const readReportFromFS = filepath =>
  Promise.resolve()
    .then(() => {
      if (!filepath) {
        throw new GnosticError(
          'Invalid arguments; filepath is required',
          GnosticErrorCodes.GNOSTIC_ERR_INVALID_ARG
        );
      }
      return readFile(filepath, 'utf8');
    })
    .then(contents => {
      try {
        return JSON.parse(contents);
      } catch (err) {
        throw new GnosticError(
          `Invalid JSON found in file ${filepath}`,
          GnosticErrorCodes.GNOSTIC_ERR_INVALID_REPORT,
          {details: err.message}
        );
      }
    });
