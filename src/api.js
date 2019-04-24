import {combineLatest, of} from 'rxjs';
import {enabledRules, fromDir, fromFile} from './config';
import {findRules, loadRuleFromRuleDef} from './rule-loader';
import {map, mergeMap, switchMap, tap, toArray} from 'rxjs/operators';

import _ from 'lodash/fp';
import {createDebugger} from './debug';
import {inspectReport} from './inspector';
import {readReport} from './report-reader';

const debug = createDebugger(module);

export const inspect = async (
  report,
  {config, autoload = true, searchPath = process.cwd()} = {}
) => {
  let loadConfig;
  if (_.isString(config)) {
    debug(`trying to load config at path ${config}`);
    loadConfig = of(fromFile(config));
  } else if (_.isEmpty(config)) {
    if (autoload) {
      debug(`searching for config from ${searchPath}`);
      loadConfig = of(fromDir(searchPath));
    } else {
      throw new Error('Missing config');
    }
  } else {
    loadConfig = of(config);
  }
  return loadConfig
    .pipe(
      map(config => ({ruleIds: enabledRules(config), config})),
      tap(({ruleIds}) => {
        debug(`found ${ruleIds.length} enabled rule(s)`);
      }),
      switchMap(({ruleIds, config}) =>
        combineLatest(
          findRules({ruleIds}).pipe(mergeMap(loadRuleFromRuleDef)),
          _.isString(report) ? readReport(report) : of(report)
        ).pipe(
          mergeMap(([rule, report]) =>
            inspectReport(report, rule, _.getOr({}, `rules.${rule.id}`, config))
          )
        )
      ),
      toArray()
    )
    .toPromise();
};
