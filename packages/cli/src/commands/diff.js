import {createDebugPipe, observable} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';
import {toObjectFromFilepath} from '@report-toolkit/fs';

import {terminalColumns, toOutput} from '../console-utils.js';
import {commandConfig, getOptions, GROUPS, OPTIONS} from './common.js';

const {
  toReportDiff,
  toReportFromObject,
  transform,
  fromTransformerChain
} = stream;

const {of, share} = observable;
const DEFAULT_PROPERTIES = [
  'environmentVariables',
  'header',
  'userLimits',
  'sharedObjects'
];
const debug = createDebugPipe('cli', 'commands', 'diff');

const OP_COLORS = {
  add: 'green',
  remove: 'red',
  replace: 'yellow'
};
const OP_CODE = {
  add: 'A',
  remove: 'D',
  replace: 'M'
};

export const command = 'diff <file1> <file2>';

export const desc = 'Diff two reports';

export const builder = yargs =>
  yargs.options({
    prop: {
      default: DEFAULT_PROPERTIES,
      description: 'Filter by property name',
      group: GROUPS.FILTER,
      nargs: 1,
      type: 'array'
    },
    ...getOptions(OPTIONS.OUTPUT, {sourceType: 'object'}),
    ...OPTIONS.JSON_TRANSFORM,
    ...OPTIONS.TABLE_TRANSFORM,
    ...OPTIONS.FILTER_TRANSFORM
  });

/**
 * @todo handle same-file issue
 * @todo handle output-to-file
 * @param {*} argv
 */
export const handler = argv => {
  const {file1, file2} = argv;
  const DEFAULT_DIFF_CONFIG = {
    properties: DEFAULT_PROPERTIES,
    showSecretsUnsafe: false,
    disableSort: true,
    fields: [
      {
        color: row => OP_COLORS[row.op],
        label: 'Op',
        value: row => OP_CODE[row.op],
        widthPct: 4
      },
      {
        color: row => OP_COLORS[row.op],
        label: 'Path',
        value: 'path',
        widthPct: 24
      },
      {
        label: file1,
        value: 'value',
        widthPct: 36
      },
      {
        label: file2,
        value: 'oldValue',
        widthPct: 36
      }
    ],
    outputHeader: `Diff: ${file1} <=> ${file2}`,
    maxWidth: terminalColumns
  };
  const config = commandConfig('diff', argv, DEFAULT_DIFF_CONFIG);

  const source = of(file1, file2).pipe(
    toObjectFromFilepath(),
    toReportFromObject(config),
    debug(report => `created Report from ${report.filepath}`),
    toReportDiff(config),
    share()
  );

  fromTransformerChain(argv.transform, config)
    .pipe(
      transform(source, {beginWith: 'object'}),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};
