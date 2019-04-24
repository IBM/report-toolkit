import {reporter, tableHeader} from '../cli-reporter';

import _ from 'lodash/fp';
import {loadRulesFromDirpath} from '../rule-loader';
import {toArray} from 'rxjs/operators';

export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const handler = () => {
  loadRulesFromDirpath()
    .pipe(toArray())
    .subscribe(rules => {
      reporter.table(
        tableHeader(['Rule ID', 'Description']),
        rules.map(rule => [
          reporter.format.green(rule.id),
          _.getOr('(no description)', 'description', rule)
        ])
      );
    });
};
