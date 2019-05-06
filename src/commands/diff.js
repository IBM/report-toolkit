import {toString, toTable} from '../console';

import {DIFF_DEFAULT_PROPERTIES} from '../diff-report';
import color from 'ansi-colors';
import {diff} from '../api/observable';

export const command = 'diff <file1> <file2>';

export const desc = 'Diff two reports';

export const builder = yargs =>
  yargs.options({
    prop: {
      type: 'array',
      nargs: 1,
      description: 'Filter by root prop name',
      default: DIFF_DEFAULT_PROPERTIES,
      group: 'Filter:'
    },
    'show-secrets-unsafe': {
      type: 'boolean',
      description: 'Live dangerously & do not automatically redact secrets',
      group: 'Output:'
    },
    truncate: {
      type: 'boolean',
      description: 'Truncate values',
      group: 'Output:',
      default: true,
      conflicts: 'wrap'
    },
    wrap: {
      type: 'boolean',
      description: 'Hard-wrap values (implies --no-truncate)',
      group: 'Output:',
      conflicts: 'truncate'
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
    wrap: wrapValues = false
  } = argv;
  const redactSecrets = !argv['show-secrets-unsafe'];
  diff(file1, file2, {properties, redactSecrets})
    .pipe(
      toTable(
        ({path, value, oldValue, op}) => [
          color[OP_COLORS[op]](OP_CODE[op]),
          color[OP_COLORS[op]](path),
          value,
          oldValue
        ],
        ['Op', 'Path', file1, file2],
        {stretch: true, truncateValues, wrapValues}
      ),
      toString(`Diff: ${file1} <=> ${file2}`)
    )
    .subscribe(console.log);
};
