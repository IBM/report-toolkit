import {
  DIFF_DEFAULT_PROPERTIES,
  diffReports,
  pathToProperty
} from '../diff-report';
import {count, filter, map, mergeMap, share, toArray} from 'rxjs/operators';
import {filterEnabledRules, loadConfig} from '../config';

import {Inspector} from '../inspect-report';
import _ from 'lodash/fp';
import {createDebugger} from '../debug';
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

export {loadReport};

export {loadConfig} from '../config';

export {loadRules};

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

  const reports = loadReport(filepaths, {redactSecrets}).pipe(share());

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
