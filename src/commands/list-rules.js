import _ from 'lodash/fp';
import color from 'ansi-colors';
import {queryRulesStream} from '../api';
import {toTable} from '../console';

export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const handler = () => {
  queryRulesStream()
    .pipe(
      toTable(
        rule => [
          color.cyan(rule.id),
          _.getOr(color.dim('(no description)'), 'description', rule)
        ],
        ['Rule', 'Description']
      ),
      toString('Available Rules')
    )
    .subscribe(console.log);
};
