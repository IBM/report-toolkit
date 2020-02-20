import {_} from '@report-toolkit/common';
import {observable as observableAPI} from '@report-toolkit/core';

import {terminalColumns, toOutput} from '../console-utils.js';
import {
  fromFilepathsToReports,
  getTransformerOptions,
  GROUPS,
  mergeCommandConfig,
  OPTIONS
} from './common.js';

const {diff, transform, fromTransformerChain} = observableAPI;

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

// @ts-ignore
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
      type: 'boolean',
      conflicts: ['i', 'x']
    },
    ...OPTIONS.OUTPUT,
    ...getTransformerOptions({sourceType: 'object'})
  });

// @ts-ignore
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
    transformers: {
      table: {
        outputHeader: `Diff: ${file1} <=> ${file2}`,
        maxWidth: terminalColumns,
        colWidths: [5],
        fields: [
          {
            color: ({op}) => OP_COLORS.get(op),
            label: 'Op',
            value: ({op}) => OP_CODE.get(op)
          },
          {
            color: ({op}) => OP_COLORS.get(op),
            label: 'Field',
            value: ({field}) => formatKeypath(field)
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
    fromFilepathsToReports(file1),
    fromFilepathsToReports(file2),
    config
  );

  fromTransformerChain(argv.transform, config)
    .pipe(
      transform(source, {
        beginWith: 'object',
        defaultTransformerConfig: config.transformers.table
      }),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};
