import _ from 'lodash';
import {loadRulesFromDirpath} from '../rule-loader';
import {reporter} from '../cli-reporter';
import {toArray} from 'rxjs/operators';
export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const handler = () => {
  loadRulesFromDirpath()
    .pipe(toArray())
    .subscribe(ruleDefs => {
      reporter.table(
        ['Rule ID', 'Description'].map(header => reporter.format.dim(header)),
        ruleDefs.map(ruleDef => [
          reporter.format.green(ruleDef.id),
          _.get(ruleDef, 'meta.docs.description', '(no description)')
        ])
      );
    });
};
