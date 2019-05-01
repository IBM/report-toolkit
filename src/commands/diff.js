import {toString, toTable} from '../console';

import {DIFF_DEFAULT_PROPERTIES} from '../diff-report';
import color from 'ansi-colors';
import {diffStream} from '../api';

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

export const handler = ({file1, file2, prop: properties} = {}) => {
  diffStream(file1, file2, {properties})
    .pipe(
      toTable(
        ({path, value, oldValue, op}) => [
          color[OP_COLORS[op]](OP_CODE[op]),
          color[OP_COLORS[op]](path),
          value,
          oldValue
        ],
        ['Op', `Path`, `Value [${file1}]`, `Value [${file2}]`],
        {stretch: true}
      ),
      toString(`Diff: ${file1} <=> ${file2}`)
    )
    .subscribe(console.log);
};
