import {findConfigs, fromDir, fromFile} from './config';
import {findRuleDefs, loadRuleFromRuleDef} from './rule-loader';
import {map, mergeMap, toArray} from 'rxjs/operators';

import {Inspector} from './inspector';
import _ from 'lodash/fp';
import {createDebugger} from './debug';
import {of} from 'rxjs';
import {readReport} from './report-reader';

const debug = createDebugger(module);

export const inspect = async (
  reports = [],
  {config, autoload = true, searchPath = process.cwd()} = {}
) => {
  if (_.isEmpty(reports)) {
    throw new Error('Invalid parameters: one or more reports is required');
  }

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

  const reportObjects = (_.isArray(reports)
    ? of(...reports)
    : of(reports)
  ).pipe(mergeMap(readReport));

  return loadConfig
    .pipe(
      map(findConfigs),
      mergeMap(configs =>
        findRuleDefs({configs}).pipe(
          mergeMap(loadRuleFromRuleDef),
          map(rule => Inspector.create(rule, configs[rule.id]))
        )
      ),
      mergeMap(inspector =>
        reportObjects.pipe(mergeMap(report => inspector.inspect(report)))
      ),
      toArray()
    )
    .toPromise();
};
