import {fail, ok, outputHeader, table} from '../console';

import _ from 'lodash/fp';
import color from 'ansi-colors';
import {inspect$} from '../api';
import stringify from 'fast-safe-stringify';
import {toArray} from 'rxjs/operators';

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs =>
  yargs.positional('file', {
    type: 'array',
    coerce: v => (_.isArray(v) ? v : [v])
  });

export const handler = ({file: files, config}) => {
  inspect$(files, {config, autoload: false})
    .pipe(toArray())
    .subscribe(results => {
      console.log(outputHeader('Diagnostic Report Inspection'));
      if (!results.length) {
        _.forEach(
          filename => console.log(ok(`${filename}: no issues found`)),
          files
        );
      } else {
        const t = table(['File', 'Rule', 'Message', 'Data']);
        const groups = _.groupBy('filepath', results);
        t.push(
          ..._.reduce(
            (acc, group) => {
              const rowSpan = group.length;
              const firstRow = group.shift();
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
                  group
                )
              ]);
            },
            [],
            groups
          )
        );
        console.log(String(t));
        console.log(
          '\n' + fail(`Found ${results.length} issues in ${files.length} files`)
        );
      }
    });
};
