import {map, reduce, startWith} from 'rxjs/operators';
import {outputHeader, table} from '../console';

import _ from 'lodash/fp';
import color from 'ansi-colors';
import {queryRules$} from '../api';

export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const handler = () => {
  queryRules$()
    .pipe(
      reduce(
        (t, rule) =>
          t.concat([
            [
              color.cyan(rule.id),
              _.getOr(color.dim('(no description)'), 'description', rule)
            ]
          ]),
        table(['Rule', 'Description'])
      ),
      map(String),
      startWith(outputHeader('Available Rules'))
    )
    .subscribe(console.log);
};
