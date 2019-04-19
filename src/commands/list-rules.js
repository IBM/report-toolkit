import _ from 'lodash';
import {loadRulesFromDirpath} from '../rule-loader';
import {reporter} from '../cli-reporter';
import {toArray} from 'rxjs/operators';

export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const handler = () => {
  loadRulesFromDirpath()
    .pipe(toArray())
    .subscribe(rules => {
      reporter.table(
        ['Rule ID', 'Description'].map(header => reporter.format.dim(header)),
        rules.map(rule => [
          reporter.format.green(rule.id),
          _.get(rule, 'meta.docs.description', '(no description)')
        ])
      );
    });
};
