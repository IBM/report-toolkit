import {defaultIfEmpty, mergeMap, toArray} from 'rxjs/operators';
import {findRules, loadRuleFromRuleDef} from '../rule-loader';
import {reporter, tableHeader} from '../cli-reporter';

import _ from 'lodash/fp';
import {combineLatest} from 'rxjs';
import {enabledRules} from '../config';
import {inspect} from '../inspector';
import {readReport} from '../report-reader';

export const command = 'inspect <file>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const handler = ({file, config = {}} = {}) => {
  const ruleIds = enabledRules(config);
  const rules = _.getOr({}, 'rules', config);

  combineLatest(
    findRules({ruleIds}).pipe(mergeMap(loadRuleFromRuleDef)),
    readReport(file)
  )
    .pipe(
      mergeMap(([rule, report]) =>
        inspect(report, rule, _.get(rule.id, rules))
      ),
      defaultIfEmpty(`${file} contains no known issues`),
      toArray()
    )
    .subscribe(results => {
      if (typeof results[0] === 'string') {
        reporter.success(results[0]);
      } else {
        reporter.table(
          tableHeader(['Rule ID', 'Message', 'Data']),
          results.map(({id, message, data}) => [
            reporter.format.green(id),
            message,
            JSON.stringify(data)
          ])
        );
      }
    });
};
