import {EMPTY, concat, iif, of} from 'rxjs';
import {concatMap, map, toArray} from 'rxjs/operators';
import {createTable, fail, outputHeader} from '../console';

import _ from 'lodash/fp';
import color from 'ansi-colors';
import {inspect$} from '../api';
import stringify from 'fast-safe-stringify';

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs =>
  yargs.positional('file', {
    type: 'array',
    coerce: v => (_.isArray(v) ? v : [v])
  });

export const handler = ({file: files, config}) => {
  concat(
    inspect$(files, {config, autoload: false}).pipe(
      // note that we have to flatten the observable here,
      // because we need the count for each filepath to compute
      // the row span in the table.
      toArray(),
      map(results =>
        createTable(['File', 'Rule', 'Message', 'Data']).concat([
          ..._.reduce(
            (acc, group) => {
              const rowSpan = group.length;
              const firstRow = group[0];
              return acc.concat([
                [
                  {
                    content: color.cyan(firstRow.filepath),
                    rowSpan
                  },
                  color.magenta(firstRow.id),
                  firstRow.message,
                  firstRow.data ? stringify(firstRow.data) : ''
                ],
                ..._.map(
                  row => [
                    color.magenta(row.id),
                    row.message,
                    row.data ? stringify(row.data) : ''
                  ],
                  group.slice(1)
                )
              ]);
            },
            [],
            _.groupBy('filepath', results)
          )
        ])
      ),
      concatMap(results =>
        iif(
          () => results.length,
          of(
            outputHeader('Diagnostic Report Inspection'),
            String(results),
            fail(`Found ${results.length} issues in ${files.length} files`)
          ),
          EMPTY
        )
      )
    )
  ).subscribe(console.log);
};
