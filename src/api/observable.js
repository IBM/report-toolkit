import {
  DIFF_DEFAULT_PROPERTIES,
  diffReports,
  pathToProperty
} from '../diff-report';
import {count, filter, mergeMap, share, toArray} from 'rxjs/operators';
import {createDebugger, isDebugEnabled} from '../debug';
import {filterEnabledRules, loadConfig} from '../config';

import _ from 'lodash/fp';
import {inspectReports} from '../inspect-report';
import {loadReport} from '../load-report';
import {loadRuleConfig} from '../rule-config';
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
  {
    config,
    search = true,
    configSearchPath = process.cwd(),
    ruleSearchPath,
    redactSecrets
  } = {}
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

  return loadRuleConfigs({
    config,
    configSearchPath,
    ruleSearchPath,
    search
  }).pipe(inspectReports(reports));
};

export const loadRuleConfigs = ({
  config,
  configSearchPath,
  ruleSearchPath,
  search
} = {}) =>
  loadConfig({config, searchPath: configSearchPath, search}).pipe(
    mergeMap(config =>
      loadRules({
        ruleIds: filterEnabledRules(config),
        searchPath: ruleSearchPath
      }).pipe(loadRuleConfig(config))
    )
  );

// usefulness of these being public APIs is dubious
export {loadReport, loadConfig, loadRules};
