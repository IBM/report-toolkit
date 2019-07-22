import {_, constants,observable} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';
import {toObjectFromFilepath} from '@report-toolkit/fs';
import {transformers} from '@report-toolkit/transformers';

const {toReportFromObject} = stream;

const {fromAny, share} = observable;

export const GROUPS = {
  FILTER: 'Filter:',
  OUTPUT: 'Output:',
  TRANSFORM: 'Transform:'
};

export const OPTIONS = {
  OUTPUT: {
    color: {
      default: true,
      description: 'Use color output where applicable',
      group: GROUPS.OUTPUT,
      type: 'boolean'
    },
    output: {
      alias: 'o',
      description: 'Output to file instead of STDOUT',
      group: GROUPS.OUTPUT,
      normalize: true,
      requiresArg: true,
      type: 'string'
    },
    pretty: {
      description: 'Pretty-print JSON output',
      group: GROUPS.TRANSFORM,
      type: 'boolean'
    },
    'show-secrets-unsafe': {
      description: 'Live dangerously & do not automatically redact secrets',
      group: GROUPS.TRANSFORM,
      type: 'boolean'
    },
    transform: {
      // @todo list transform aliases
      alias: 't',
      choices: Object.keys(transformers),
      coerce: _.castArray,
      default: constants.DEFAULT_TRANSFORMER,
      description: 'Transform(s) to apply',
      group: GROUPS.TRANSFORM
    },
    truncate: {
      conflicts: 'wrap',
      default: true,
      description: 'Truncate values (table format)',
      group: GROUPS.TRANSFORM,
      type: 'boolean'
    },
    wrap: {
      conflicts: 'truncate',
      description:
        'Hard-wrap values (table format only; implies --no-truncate)',
      group: GROUPS.TRANSFORM,
      type: 'boolean'
    }
  }
};

export const fromFilepathToReport = (filepaths, opts = {}) =>
  fromAny(filepaths).pipe(
    toObjectFromFilepath(opts),
    toReportFromObject(opts),
    share()
  );
