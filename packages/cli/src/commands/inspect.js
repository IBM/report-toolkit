import {_, constants, observable} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';
import {
  fromSearchpathToRuleDefinition,
  toObjectFromFilepath
} from '@report-toolkit/fs';
import {join} from 'path';
import resolvePkg from 'resolve-pkg';

import {fail, toOutput} from '../console-utils.js';
import {fromFilepathToReport, GROUPS, OPTIONS} from './common.js';

const {ERROR, INFO, WARNING} = constants;
const {toInspection, toReportFromObject, toRuleConfig} = stream;

const BUILTIN_RULES_DIR = join(
  resolvePkg('@report-toolkit/rules', {cwd: __dirname}),
  'src'
);

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs =>
  yargs
    .positional('file', {
      coerce: _.castArray,
      type: 'array'
    })
    .options({
      severity: {
        choices: [INFO, WARNING, ERROR],
        default: ERROR,
        description: 'Minimum severity level for messages',
        group: GROUPS.FILTER
      },
      ...OPTIONS.OUTPUT
    });

export const handler = argv => {
  const {
    file: filepaths,
    config,
    truncate: truncateValues = true,
    wrap: wrapValues = false,
    format = 'table',
    pretty = false,
    color,
    output,
    severity = ERROR,
    showSecretsUnsafe = false
  } = argv;
  /**
   * @type {Observable<Report>}
   */
  const reports = fromFilepathToReport(filepaths, {
    ...config.inspect,
    showSecretsUnsafe
  });
  fromSearchpathToRuleDefinition(BUILTIN_RULES_DIR)
    .pipe(
      toRuleConfig(config),
      toInspection(reports, {severity}),
      // toFormattedString(format, {
      //   color,
      //   fields: [
      //     {
      //       label: 'File',
      //       value: 'filepath',
      //       widthPct: 30
      //     },
      //     {
      //       label: 'Rule',
      //       value: 'id',
      //       widthPct: 20
      //     },
      //     {
      //       label: 'Message',
      //       value: 'message',
      //       widthPct: 50
      //     }
      //   ],
      //   outputFooter: t =>
      //     fail(`Found ${t.length} issue(s) in ${filepaths.length} file(s)`),
      //   outputHeader: 'diagnostic Report Inspection',
      //   pretty,
      //   truncateValues,
      //   wrapValues
      // }),
      toOutput(output)
    )
    .subscribe();
};
/**
 * @template T
 * @typedef {import('rxjs').Observable<T>} Observable
 */
/**
 * @typedef {import('@report-toolkit/report').Report} Report
 */
