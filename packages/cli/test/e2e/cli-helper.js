import {createDebugger} from '@report-toolkit/common';
import csv from 'csvtojson';
import execa from 'execa';

const BIN_PATH = require.resolve('../..');

const debug = createDebugger('cli', 'test', 'e2e', 'cli-helper');

export const run = async (...flags) => execa(BIN_PATH, flags);

export const runAsJSON = async (...flags) => {
  const result = await run(...flags, '-t', 'json');
  debug(`converting result of ${result.command} from JSON`);
  return JSON.parse(result.stdout);
};

export const runAsCSV = async (...flags) => {
  const result = await run(...flags, '-t', 'csv');
  debug(`converting result of ${result.command} from CSV`);
  return csv().fromString(result.stdout);
};
