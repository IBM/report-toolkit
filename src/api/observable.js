import {
  DIFF_DEFAULT_PROPERTIES,
  diffReports,
  pathToProperty
} from '../diff-report';
import {filter, map, mergeMap, share} from 'rxjs/operators';
import {filterEnabledRules, loadConfig} from '../config';
import {of, throwError, zip} from 'rxjs';

import {Inspector} from '../inspect-report';
import _ from 'lodash/fp';
import {debug} from './index';
import {loadRules} from '../rule-loader';
import {readReport} from '../read-report';

export const diff = (
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

export {readReport};

export {loadConfig} from '../config';

export {loadRules};

export const inspect = (
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
  return loadConfig({config, searchPath, search}).pipe(
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
