import {
  DIFF_DEFAULT_PROPERTIES,
  diffReports,
  pathToProperty
} from './diff-report';
import {EMPTY, of, throwError, zip} from 'rxjs';
import {filter, map, mergeMap, toArray} from 'rxjs/operators';
import {filterEnabledRules, fromDir, fromFile, fromObject} from './config';

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

  return loadConfigStream(config, {searchPath, search}).pipe(
    mergeMap(config =>
      loadRules({ruleIds: filterEnabledRules(config)}).pipe(
        map(rule => Inspector.create(rule, config[rule.id]))
      )
    ),
    mergeMap(inspector =>
      (_.isArray(reports) ? of(...reports) : of(reports)).pipe(
        mergeMap(report => readReport(report, {redactSecrets})),
        mergeMap(report => inspector.inspect(report))
      )
    )
  );
};

export const inspect = async (...args) =>
  inspectStream(...args)
    .pipe(toArray())
    .toPromise();

export const loadConfigStream = (
  config,
  {search = true, searchPath = process.cwd()} = {}
) =>
  of(config).pipe(
    map(config => {
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
    })
  );

export const loadConfig = async (...args) =>
  loadConfigStream(...args).toPromise();

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
