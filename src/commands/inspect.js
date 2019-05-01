import {EMPTY, iif, of} from 'rxjs';
import {concatMap, map, toArray} from 'rxjs/operators';
import {createTable, fail, outputHeader} from '../console';

import _ from 'lodash/fp';
import color from 'ansi-colors';
import {inspectStream} from '../api';
import stringify from 'fast-safe-stringify';

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs =>
  yargs
    .positional('file', {
      type: 'array',
      coerce: v => (_.isArray(v) ? v : [v])
    })
    .options({
      'show-secrets-unsafe': {
        type: 'boolean',
        description: 'Live dangerously & do not automatically redact secrets',
        group: 'Output:'
      }
    });

export const handler = argv => {
  const {file: files, config} = argv;
  const redactSecrets = argv['show-secrets-unsafe'];
  inspectStream(files, {config, autoload: false, redactSecrets})
    .pipe(
      // note that we have to flatten the observable here,
      // because we need the count for each filepath to compute
      // the row span in the table.
      toArray(),
      map(results => {
        const t = createTable(['File', 'Rule', 'Message', 'Data'], {
          stretch: true,
          colWidthsPct: [32, 12, 36, 20]
        });
        t.push(
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
        );
        return t;
      }),
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
    .subscribe(console.log);
};
