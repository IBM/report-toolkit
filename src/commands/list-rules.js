import {map, reduce} from 'rxjs/operators';
import {outputHeader, table} from '../console';

import _ from 'lodash/fp';
import color from 'ansi-colors';
import {loadRulesFromDirpath} from '../rule-loader';

export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const handler = () => {
  loadRulesFromDirpath()
    .pipe(
      reduce((table, rule) => {
        table.push([
          color.cyan(rule.id),
          _.getOr(color.dim('(no description)'), 'description', rule)
        ]);
        return table;
      }, table(['Rule', 'Description'])),
      map(String)
    )
    .subscribe(table => {
      console.log(outputHeader('Available Rules'));
      console.log(table);
    });
};
