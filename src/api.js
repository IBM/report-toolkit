import {
  DIFF_DEFAULT_PROPERTIES,
  diffReports,
  pathToProperty
} from './diff-report';
import {filter, map, mergeMap, share, toArray} from 'rxjs/operators';
import {filterEnabledRules, findConfig} from './config';
import {of, throwError, zip} from 'rxjs';

import {Inspector} from './inspect-report';
import _ from 'lodash/fp';
import {createDebugger} from './debug';
import {loadRules} from './rule-loader';
import {readReport} from './read-report';

const debug = createDebugger(module);

export const inspectStream = (
  reports = [],
  {config, search = true, searchPath = process.cwd(), redactSecrets} = {}
) => {
  if (_.isEmpty(reports)) {
    return throwError(
      new Error('Invalid parameters: one or more reports is required')
    );
  }

  debug(`inspecting ${reports.length} report(s)`);
  const reportObjs = (_.isArray(reports) ? of(...reports) : of(reports)).pipe(
    mergeMap(report => readReport(report, {redactSecrets})),
    share()
  );
  return findConfig({config, searchPath, search}).pipe(
    mergeMap(config => {
      const ruleIds = filterEnabledRules(config);
      return loadRules({ruleIds}).pipe(
        map(rule => Inspector.create(rule, config[rule.id]))
      );
    }),
    mergeMap(inspector =>
      reportObjs.pipe(mergeMap(report => inspector.inspect(report)))
    )
  );
};

export const inspect = async (...args) =>
  inspectStream(...args)
    .pipe(toArray())
    .toPromise();

export {findConfig as loadConfigStream} from './config';

export const loadConfig = async (...args) => findConfig(...args).toPromise();

export const queryRulesStream = (...args) => loadRules(...args);

export const queryRules = async (...args) =>
  queryRulesStream(...args)
    .pipe(toArray())
    .toPromise();

export const diffStream = (
  reportA,
  reportB,
  {properties = DIFF_DEFAULT_PROPERTIES, redactSecrets = true} = {}
) =>
  zip(
    readReport(reportA, {redactSecrets}),
    readReport(reportB, {redactSecrets})
  ).pipe(
    mergeMap(([reportObjA, reportObjB]) => diffReports(reportObjA, reportObjB)),
    filter(({path}) => properties.includes(pathToProperty(path)))
  );

export const diff = async (...args) =>
  diffStream(...args)
    .pipe(toArray())
    .toPromise();

export const loadReport = async (...args) => readReport(...args).toPromise();

export {readReport as loadReportStream};
