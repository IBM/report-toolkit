import {bindNodeCallback, filter, map, mergeAll, pipeIf} from './observable';

import {Rule} from './rule';
import _ from 'lodash/fp';
import {createDebugger} from './debug';
import fs from 'fs';
import path from 'path';

const RULES_DIR = path.join(__dirname, 'rules');

const debug = createDebugger(module);
const readdir = bindNodeCallback(fs.readdir);

const createRuleDefFromDirpath = _.curry((dirpath, entry) =>
  createRuleDefFromFilepath(path.resolve(dirpath, entry))
);

const createRuleDefFromFilepath = filepath => ({
  filepath,
  id: path.basename(filepath, '.js')
});

export const readDirpath = (dirpath = RULES_DIR) =>
  readdir(dirpath).pipe(mergeAll());

export const loadRuleFromRuleDef = _.memoize(({filepath, id}) =>
  Rule.create({
    ..._.pick(['inspect', 'meta'], require(filepath)),
    id,
    filepath
  })
);

export const loadRuleFromFilepath = _.pipe(
  createRuleDefFromFilepath,
  loadRuleFromRuleDef
);

/**
 * Loads rules in dirpath
 * @function
 * @returns {Observable<Object>} Exports of rule file w/ ruleId
 */
export const loadRules = (...args) =>
  findRuleDefs(...args).pipe(map(loadRuleFromRuleDef));

export const findRuleDefs = ({searchPath = RULES_DIR, ruleIds = []} = {}) => {
  ruleIds = new Set(ruleIds);
  const ruleIdsCount = _.size(ruleIds);
  if (!ruleIdsCount) {
    debug(
      'no enabled rules found; enabling ALL rules in an attempt to be useful'
    );
  }
  return readDirpath(searchPath).pipe(
    map(createRuleDefFromDirpath(searchPath)),
    pipeIf(ruleIdsCount, filter(({id}) => ruleIds.has(id)))
  );
};
