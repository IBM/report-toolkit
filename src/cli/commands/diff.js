import {GROUPS, OPTIONS} from './common';

import {DIFF_DEFAULT_PROPERTIES} from '../../diff-report';
import _ from 'lodash/fp';
import colors from '../colors';
import {diff} from '../../api/stream';
import {toFormattedString} from '../console';

export const command = 'diff <file1> <file2>';

export const desc = 'Diff two reports';

export const builder = yargs =>
  yargs.options({
    prop: {
      type: 'array',
      nargs: 1,
      description: 'Filter by root prop name',
      default: DIFF_DEFAULT_PROPERTIES,
      group: GROUPS.FILTER
    },
    'show-secrets-unsafe': {
      type: 'boolean',
      description: 'Live dangerously & do not automatically redact secrets',
      group: GROUPS.OUTPUT
    },
    ...OPTIONS.OUTPUT
  });

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

/**
 * @todo handle same-file issue
 * @param {*} argv
 */
export const handler = argv => {
  const {
    file1,
    file2,
    prop: properties,
    truncate: truncateValues = true,
    wrap: wrapValues = false,
    format = 'table',
    pretty = false,
    color
  } = argv;
  const redactSecrets = !argv['show-secrets-unsafe'];
  diff(file1, file2, {properties, redactSecrets})
    .pipe(
      toFormattedString(format, {
        color,
        fields: [
          {
            label: 'Op',
            value: row => colors[OP_COLORS[row.op]](OP_CODE[row.op]),
            widthPct: 4
          },
          {
            label: 'Path',
            value: row => colors[OP_COLORS[row.op]](row.path),
            widthPct: 24
          },
          {
            label: file1,
            value: _.get('value'),
            widthPct: 36
          },
          {
            label: file2,
            value: _.get('oldValue'),
            widthPct: 36
          }
        ],
        pretty,
        outputHeader: `Diff: ${file1} <=> ${file2}`,
        truncateValues,
        wrapValues
      })
    )
    .subscribe(console.log);
};
