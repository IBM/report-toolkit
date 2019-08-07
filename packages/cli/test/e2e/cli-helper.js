import {createDebugger} from '@report-toolkit/common';
import csv from 'csvtojson';
import execa from 'execa';

const BIN_PATH = require.resolve('../..');

const debug = createDebugger('cli', 'test', 'e2e', 'cli-helper');

/**
 * Run executable with command, flags, etc.
 * Use when we're not sure if the executable will end in failure
 * @param  {...string} flags - Flags
 * @returns {Promise<execa.ExecaReturnValue>} Result
 */
export const run = async (...flags) => runWithOptions(flags);

/**
 * Run executable with command, flags, etc., but use `json` as final executable,
 * and parse the result into a JS object. Should be used with a command that we
 * expect NOT to exit with a nonzero code.
 * @param  {...string} flags - Flags
 * @returns {Promise<any>} Result of `JSON.parse()`
 */
export const runAsJSON = async (...flags) => {
  const result = await run(...flags, '-t', 'json');
  debug(`converting result of ${result.command} from JSON`);
  return JSON.parse(result.stdout);
};

/**
 * Run executable with command, flags, etc., but use `csv` as final executable,
 * and parse the result into a JS object. Should be used with a command that we
 * expect NOT to exit with a nonzero code.
 * @param  {...string} flags - Flags
 * @returns {Promise<any>} Result of `JSON.parse()`
 */
export const runAsCSV = async (...flags) => {
  const result = await run(...flags, '-t', 'csv');
  debug(`converting result of ${result.command} from CSV`);
  return csv().fromString(result.stdout);
};

/**
 * Run executable, specifying additional options to execa
 * @param {string[]} flags - Any flags to pass to the executable
 * @param {execa.Options} opts - Options for execa
 * @returns {Promise<execa.ExecaReturnValue>} Result
 */
export const runWithOptions = (flags, opts = {}) =>
  execa(process.execPath, [BIN_PATH, ...flags, '--verbose'], opts);
