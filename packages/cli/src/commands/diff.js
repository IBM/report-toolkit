import {
  _,
  constants,
  createDebugPipe,
  observable
} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';
import {toObjectFromFilepath} from '@report-toolkit/fs';

import {terminalColumns, toOutput} from '../console-utils.js';
import {getOptions, GROUPS, OPTIONS} from './common.js';

const {toReportDiff, toReportFromObject, fromTransformers} = stream;
const {DEFAULT_DIFF_OPTIONS} = constants;
const {of, share} = observable;

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
      default: DEFAULT_DIFF_OPTIONS.properties,
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
  const {file1, file2, prop: properties} = argv;
  const source = of(file1, file2).pipe(
    toObjectFromFilepath(),
    debug(
      () =>
        argv.config.diff && `using diff-specific options: ${argv.config.diff}`
    ),
    toReportFromObject({
      ...argv.config.diff,
      disableSort: true,
      showSecretsUnsafe: argv.showSecretsUnsafe
    }),
    debug(report => `created Report from ${report.filepath}`),
    toReportDiff({...argv.config.diff, properties}),
    share()
  );

  fromTransformers(source, argv.transform, {
    beginWith: 'object',
    config: _.mergeAll([
      _.getOr({}, 'config', argv),
      {
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
      }
    ]),
    overrides: argv
  })
    .pipe(toOutput(argv.output, {color: argv.color}))
    .subscribe();
};
