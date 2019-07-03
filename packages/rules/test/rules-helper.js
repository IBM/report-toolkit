import {_} from '@gnostic/common';
import {INFO} from '@gnostic/common/src/constants.js';
import {fromAny, map} from '@gnostic/common/src/observable.js';
import {createRule, toInspection} from '@gnostic/core/src/stream.js';
import {fromFilepathToRuleDefinition, toObjectFromFilepath} from '@gnostic/fs';

export const createInspect = (ruleFilepath, config = {}) => {
  createRule.cache.clear();
  const ruleConfigs = fromFilepathToRuleDefinition(
    require.resolve(ruleFilepath)
  ).pipe(
    map(({ruleDef, filepath, id}) =>
      createRule(ruleDef, {filepath, id}).toRuleConfig({rules: {[id]: config}})
    )
  );
  return (filepaths, opts = {}) => {
    const reports = fromAny(filepaths).pipe(
      map(require.resolve),
      toObjectFromFilepath()
    );

    return ruleConfigs.pipe(toInspection(reports, {severity: INFO, ...opts}));
  };
};

export const getDefaultConfigValue = (rulePath, configProp) =>
  _.get(`meta.schema.properties.${configProp}.default`, require(rulePath));
