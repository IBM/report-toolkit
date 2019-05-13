import {
  DIFF_DEFAULT_PROPERTIES,
  diffReports,
  pathToProperty
} from '../diff-report';
import {count, filter, map, mergeMap, share} from 'rxjs/operators';
import {filterEnabledRules, loadConfig} from '../config';
import {loadReport, loadReports} from '../load-report';
import {throwError, zip} from 'rxjs';

import {Inspector} from '../inspect-report';
import _ from 'lodash/fp';
import {createDebugger} from '../debug';
import {loadRules} from '../rule-loader';

const debug = createDebugger(module);

export const diff = (
  reportA,
  reportB,
  {properties = DIFF_DEFAULT_PROPERTIES, redactSecrets = true} = {}
) =>
  zip(
    loadReport(reportA, {redactSecrets}),
    loadReport(reportB, {redactSecrets})
  ).pipe(
    mergeMap(([reportObjA, reportObjB]) => diffReports(reportObjA, reportObjB)),
    filter(({path}) => properties.includes(pathToProperty(path)))
  );

export {loadReports};

export {loadConfig} from '../config';

export {loadRules};

export const inspect = (
  filepaths = [],
  {config, search = true, searchPath = process.cwd(), redactSecrets} = {}
) => {
  if (_.isEmpty(filepaths)) {
    return throwError(
      new Error('Invalid parameters: one or more filepaths are required')
    );
  }

  const reports = loadReports(filepaths, {redactSecrets}).pipe(share());

  reports.pipe(count()).subscribe({
    next(count) {
      debug(`loading ${count} report(s)...`);
    },
    complete() {
      debug(`all report(s) loaded`);
    }
  });

  return loadConfig({config, searchPath, search}).pipe(
    mergeMap(config =>
      loadRules({ruleIds: filterEnabledRules(config)}).pipe(
        map(rule => Inspector.create(config[rule.id], rule))
      )
    ),
    mergeMap(inspector =>
      reports.pipe(mergeMap(report => inspector.inspect(report)))
    )
  );
};
