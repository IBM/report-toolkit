import {defaultIfEmpty, mergeMap, toArray} from 'rxjs/operators';
import {findRules, loadRuleFromRuleDef} from '../rule-loader';

import _ from 'lodash';
import {inspect} from '../inspector';
import {readReport} from '../report-reader';
import {reporter} from '../cli-reporter';

export const command = 'inspect <file>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = {};

export const handler = ({file, rules = {}} = {}) => {
  const disabledRuleIds = !_.isEmpty(rules)
    ? _.filter(rules, value => value === false || value === 'off')
    : [];

  readReport(file)
    .pipe(
      mergeMap(report =>
        findRules({disabledRuleIds}).pipe(
          mergeMap(loadRuleFromRuleDef),
          mergeMap(rule => inspect(report, rule, rules[rule.id]))
        )
      ),
      defaultIfEmpty(`${file} contains no known issues`),
      toArray()
    )
    .subscribe(results => {
      if (typeof results[0] === 'string') {
        reporter.success(results[0]);
      } else {
        reporter.table(
          ['Rule ID', 'Message', 'Data'],
          results.map(({id, message, data}) => [
            id,
            message,
            JSON.stringify(data)
          ])
        );
      }
    });
};
