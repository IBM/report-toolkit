import {fail, ok, outputHeader, table} from '../console';

import _ from 'lodash/fp';
import color from 'ansi-colors';
import {from} from 'rxjs';
import {inspect} from '../api';

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs =>
  yargs.positional('file', {
    type: 'array',
    coerce: v => (_.isArray(v) ? v : [v])
  });

export const handler = ({file: files, config}) => {
  from(inspect(files, {config, autoload: false})).subscribe(results => {
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
            acc.push(
              [
                {
                  content: color.cyan(firstRow.filepath),
                  rowSpan
                },
                color.magenta(firstRow.id),
                firstRow.message,
                firstRow.data
              ],
              ..._.map(
                row => [color.magenta(row.id), row.message, row.data],
                group
              )
            );
            return acc;
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
