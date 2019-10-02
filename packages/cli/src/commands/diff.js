import {_, observable} from '@report-toolkit/common';
import {observable as observableAPI} from '@report-toolkit/core';
import {toObjectFromFilepath} from '@report-toolkit/fs';

import {terminalColumns, toOutput} from '../console-utils.js';
import {getOptions, GROUPS, mergeCommandConfig, OPTIONS} from './common.js';

const {diff, transform, fromTransformerChain} = observableAPI;
const {of, share} = observable;

const OP_COLORS = _.toFrozenMap({
  add: 'green',
  remove: 'red',
  replace: 'yellow'
});

const OP_CODE = _.toFrozenMap({
  add: 'A',
  remove: 'D',
  replace: 'M'
});

/**
 * Best-effort reformatting RFC6902-style paths to something more familiar.
 * This will break if the key contains a `/`, which is "unlikely" (possible in the environment flag names)
 * @param {string} path - RFC6902-style path, e.g., `/header/foo/3/bar`
 * @returns Lodash-style keypath; e.g., `header.foo[3].bar`
 */
const formatKeypath = path =>
  path
    .replace('/', '')
    .replace(/\/(\d+?)(\/)?/g, '[$1]$2')
    .replace(/\//g, '.');

export const command = 'diff <file1> <file2>';

export const desc = 'Diff two reports';

export const builder = yargs =>
  yargs.options({
    includeProp: {
      description: 'Include only properties (filter)',
      group: GROUPS.FILTER,
      nargs: 1,
      type: 'array',
      alias: 'i',
      coerce: _.castArray
    },
    excludeProp: {
      description: 'Exclude properties (reject)',
      group: GROUPS.FILTER,
      nargs: 1,
      type: 'array',
      alias: 'x',
      coerce: _.castArray
    },
    all: {
      description: 'Include everything in diff',
      group: GROUPS.FILTER,
      type: 'boolean'
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
  const {
    file1,
    file2,
    includeProp: includeProperties,
    excludeProp: excludeProperties,
    all: includeAll
  } = argv;

  const config = mergeCommandConfig('diff', argv, {
    includeAll,
    includeProperties,
    excludeProperties,
    showSecretsUnsafe: false,
    sort: false,
    transformer: {
      table: {
        outputHeader: `Diff: ${file1} <=> ${file2}`,
        maxWidth: terminalColumns,
        colWidths: [4],
        fields: [
          {
            color: ({op}) => OP_COLORS.get(op),
            label: 'Op',
            value: ({op}) => OP_CODE.get(op)
          },
          {
            color: ({op}) => OP_COLORS.get(op),
            label: 'Path',
            value: ({path}) => formatKeypath(path)
          },
          {
            label: file1,
            value: 'value'
          },
          {
            label: file2,
            value: 'oldValue'
          }
        ]
      }
    }
  });

  const source = diff(
    of(file1).pipe(
      toObjectFromFilepath(),
      share()
    ),
    of(file2).pipe(
      toObjectFromFilepath(),
      share()
    ),
    config
  );

  fromTransformerChain(argv.transform, config)
    .pipe(
      transform(source, {beginWith: 'object'}),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};
