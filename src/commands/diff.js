import {map, toArray} from 'rxjs/operators';
import {toString, toTable} from '../console';

import {DIFF_DEFAULT_PROPERTIES} from '../diff-report';
import {Parser} from 'json2csv';
import colors from 'ansi-colors';
import {diff} from '../api/observable';
import stringify from 'fast-safe-stringify';

export const command = 'diff <file1> <file2>';

export const desc = 'Diff two reports';

const GROUP_OUTPUT = 'Output:';
const GROUP_FILTER = 'Filter:';

export const builder = yargs =>
  yargs.options({
    prop: {
      type: 'array',
      nargs: 1,
      description: 'Filter by root prop name',
      default: DIFF_DEFAULT_PROPERTIES,
      group: GROUP_FILTER
    },
    'show-secrets-unsafe': {
      type: 'boolean',
      description: 'Live dangerously & do not automatically redact secrets',
      group: GROUP_OUTPUT
    },
    truncate: {
      type: 'boolean',
      description: 'Truncate values (table format)',
      group: GROUP_OUTPUT,
      default: true,
      conflicts: 'wrap'
    },
    wrap: {
      type: 'boolean',
      description: 'Hard-wrap values (table format; implies --no-truncate)',
      group: GROUP_OUTPUT,
      conflicts: 'truncate'
    },
    format: {
      choices: ['table', 'csv', 'json'],
      description: 'Output format',
      group: GROUP_OUTPUT,
      default: 'table'
    },
    pretty: {
      type: 'boolean',
      group: GROUP_OUTPUT,
      description: 'Pretty-print JSON output'
    },
    color: {
      type: 'boolean',
      group: GROUP_OUTPUT,
      description: 'Use colors in table format',
      default: true
    }
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

  let output;
  switch (format) {
    case 'json':
      output = observable =>
        observable.pipe(
          toArray(),
          map(result =>
            pretty ? stringify(result, null, 2) : stringify(result)
          )
        );
      break;
    case 'csv':
      output = observable =>
        observable.pipe(
          toArray(),
          map(result => {
            const parser = new Parser({
              fields: [
                {label: 'Op', value: 'op'},
                {label: 'Path', value: 'path'},
                {label: file1, value: 'value'},
                {label: file2, value: 'oldValue'}
              ]
            });
            return parser.parse(result);
          })
        );
      break;
    default:
      output = observable =>
        observable.pipe(
          toTable(
            color
              ? ({path, value, oldValue, op}) => [
                  colors[OP_COLORS[op]](OP_CODE[op]),
                  colors[OP_COLORS[op]](path),
                  value,
                  oldValue
                ]
              : ({path, value, oldValue, op}) => [
                  OP_CODE[op],
                  path,
                  value,
                  oldValue
                ],
            ['Op', 'Path', file1, file2],
            {
              stretch: true,
              truncateValues,
              wrapValues,
              color
            }
          ),
          toString(`Diff: ${file1} <=> ${file2}`, {color})
        );
  }

  diff(file1, file2, {properties, redactSecrets})
    .pipe(output)
    .subscribe(console.log);
};
