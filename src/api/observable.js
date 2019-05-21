import {
  DIFF_DEFAULT_PROPERTIES,
  diffReports,
  pathToProperty
} from '../diff-report';
import {count, filter, map, mergeMap, share, toArray} from 'rxjs/operators';
import {createDebugger, isDebugEnabled} from '../debug';
import {filterEnabledRules, loadConfig} from '../config';

import {RuleConfig} from '../rule-config';
import _ from 'lodash/fp';
import {inspectReports} from '../inspect-report';
import {loadReport} from '../load-report';
import {loadRules} from '../rule-loader';
import {throwError} from 'rxjs';

const debug = createDebugger(module);

export const diff = (
  reportA,
  reportB,
  {properties = DIFF_DEFAULT_PROPERTIES, redactSecrets = true} = {}
) =>
  loadReport([reportA, reportB], {redactSecrets, disableSort: true}).pipe(
    toArray(),
    mergeMap(([reportObjA, reportObjB]) => diffReports(reportObjA, reportObjB)),
    filter(({path}) => properties.includes(pathToProperty(path)))
  );

export const inspect = (
  filepaths = [],
  {config, search = true, searchPath = process.cwd(), redactSecrets} = {}
) => {
  // XXX: rewrite so that loadReport throws this
  if (_.isEmpty(filepaths)) {
    return throwError(
      new Error('Invalid parameters: one or more filepaths are required')
    );
  }

  // share() creates a "multicast" observable which ensures we don't create a new
  // subscription for every item in the outer observable (created by
  // `loadRuleConfigs()` below).
  const reports = loadReport(filepaths, {redactSecrets}).pipe(share());

  // premature optimization.  DEAL WITH IT
  if (isDebugEnabled(module)) {
    reports.pipe(count()).subscribe({
      next(count) {
        debug(`loading ${count} report(s)...`);
      },
      complete() {
        debug('all report(s) loaded');
      }
    });
  }

  return loadRuleConfigs({config, searchPath, search}).pipe(
    inspectReports(reports)
  );
};

export const loadRuleConfigs = ({config, searchPath, search} = {}) =>
  loadConfig({config, searchPath, search}).pipe(
    mergeMap(config =>
      loadRules({ruleIds: filterEnabledRules(config)}).pipe(
        map(rule => RuleConfig.create(rule, config[rule.id]))
      )
    )
  );

// usefulness of these being public APIs is dubious
export {loadReport, loadConfig, loadRules};
