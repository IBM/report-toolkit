import {basename, join, resolve} from 'path';
import {map, mergeAll, mergeMap} from 'rxjs/operators';

import _ from 'lodash';
import {bindNodeCallback} from 'rxjs';
import fs from 'fs';

const readdir = bindNodeCallback(fs.readdir);

export const loadRuleFromRuleDef = async ({filepath, id}) =>
  Object.assign(_.pick(await import(filepath), ['match', 'meta']), {
    id
  });

export const createRuleDefFromDirpath = _.curry((dirpath, entry) =>
  createRuleDefFromFilepath(resolve(dirpath, entry))
);

export const createRuleDefFromFilepath = _.memoize(filepath => ({
  filepath,
  id: basename(filepath, '.js')
}));

export const loadRuleFromFilepath = _.memoize(
  _.flow(
    createRuleDefFromFilepath,
    loadRuleFromRuleDef
  )
);

/**
 * Loads rules in dirpath
 * @function
 * @param {string} [dirpath]
 * @returns {Observable<Object>} Exports of rule file w/ ruleId
 */
export const loadRulesFromDirpath = _.memoize(dirpath =>
  findRulesFromDirpath(dirpath).pipe(mergeMap(loadRuleFromRuleDef))
);

export const findRulesFromDirpath = _.memoize(
  (dirpath = join(__dirname, 'rules')) =>
    readdir(dirpath).pipe(
      mergeAll(),
      map(createRuleDefFromDirpath(dirpath))
    )
);
