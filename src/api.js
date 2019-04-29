import {EMPTY, of, throwError} from 'rxjs';
import {filterEnabledRules, fromDir, fromFile, fromObject} from './config';
import {map, mergeMap, toArray} from 'rxjs/operators';

import {Inspector} from './inspector';
import _ from 'lodash/fp';
import {createDebugger} from './debug';
import {loadRules} from './rule-loader';
import {readReport} from './report-reader';

const debug = createDebugger(module);

export const inspect$ = (
  reports = [],
  {config, search = true, searchPath = process.cwd()} = {}
) => {
  if (_.isEmpty(reports)) {
    return throwError(
      new Error('Invalid parameters: one or more reports is required')
    );
  }

  const reportObjects = (_.isArray(reports)
    ? of(...reports)
    : of(reports)
  ).pipe(mergeMap(readReport));

  return loadConfig$(config, {searchPath, search}).pipe(
    mergeMap(config =>
      loadRules({ruleIds: filterEnabledRules(config)}).pipe(
        map(rule => Inspector.create(rule, config[rule.id]))
      )
    ),
    mergeMap(inspector =>
      reportObjects.pipe(mergeMap(report => inspector.inspect(report)))
    )
  );
};

export const inspect = async (...args) =>
  inspect$(...args)
    .pipe(toArray())
    .toPromise();

export const loadConfig$ = (
  config,
  {search = true, searchPath = process.cwd()} = {}
) => {
  if (_.isString(config)) {
    debug(`trying to load config at path ${config}`);
    return fromFile(config);
  } else if (_.isPlainObject(config) || _.isArray(config)) {
    return fromObject(config);
  } else if (search) {
    debug(`searching for config from ${searchPath}`);
    return fromDir(searchPath);
  }
  return EMPTY;
};

export const loadConfig = async (...args) => loadConfig$(...args).toPromise();

export const queryRules$ = (...args) => loadRules(...args);

export const queryRules = async (...args) =>
  queryRules$(...args)
    .pipe(toArray())
    .toPromise();
