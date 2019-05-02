import {basename, join, resolve} from 'path';
import {filter, map, mergeAll, mergeMap} from 'rxjs/operators';

import {Rule} from './rule';
import _ from 'lodash/fp';
import {bindNodeCallback} from 'rxjs';
import {createDebugger} from './debug';
import fs from 'fs';

const debug = createDebugger(module);

const readdir = bindNodeCallback(fs.readdir);

const createRuleDefFromDirpath = _.curry((dirpath, entry) =>
  createRuleDefFromFilepath(resolve(dirpath, entry))
);

const createRuleDefFromFilepath = filepath => ({
  filepath,
  id: basename(filepath, '.js')
});

export const readDirpath = _.memoize((dirpath = join(__dirname, 'rules')) =>
  readdir(dirpath).pipe(mergeAll())
);

export const loadRuleFromRuleDef = _.memoize(async ({filepath, id}) =>
  Rule.create(
    _.assign(_.pick(['inspect', 'meta'], await import(filepath)), {
      id,

      filepath
    })
  )
);

export const loadRuleFromFilepath = _.pipe(
  createRuleDefFromFilepath,
  loadRuleFromRuleDef
);

/**
 * Loads rules in dirpath
 * @function
 * @param {string} [dirpath]
 * @returns {Observable<Object>} Exports of rule file w/ ruleId
 */
export const loadRules = (...args) =>
  findRuleDefs(...args).pipe(mergeMap(loadRuleFromRuleDef));

export const findRuleDefs = ({
  dirpath = join(__dirname, 'rules'),
  ruleIds = []
} = {}) => {
  ruleIds = new Set(ruleIds);
  const ruleDefs = readDirpath(dirpath).pipe(
    map(createRuleDefFromDirpath(dirpath))
  );
  const ruleIdsCount = _.size(ruleIds);
  if (!ruleIdsCount) {
    debug(
      'no enabled rules found; enabling ALL rules in an attempt to be useful'
    );
  }
  return ruleIdsCount
    ? ruleDefs.pipe(filter(({id}) => ruleIds.has(id)))
    : ruleDefs;
};
