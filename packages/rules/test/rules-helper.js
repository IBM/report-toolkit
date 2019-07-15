import {_, constants, observable} from '@gnostic/common';
import {stream} from '@gnostic/core';
import {fromFilepathToRuleDefinition, toObjectFromFilepath} from '@gnostic/fs';

const {INFO} = constants;
const {fromAny, map} = observable;
const {createRule, toInspection, toReportFromObject} = stream;

export const createInspect = (ruleFilepath, config = {}) => {
  createRule.cache.clear();
  const ruleConfigs = fromFilepathToRuleDefinition(
    require.resolve(ruleFilepath)
  ).pipe(
    map(({filepath, id, ruleDef}) =>
      createRule(ruleDef, {filepath, id}).toRuleConfig({rules: {[id]: config}})
    )
  );
  return (filepaths, opts = {}) => {
    const reports = fromAny(filepaths).pipe(
      map(require.resolve),
      toObjectFromFilepath(),
      toReportFromObject()
    );

    return ruleConfigs.pipe(toInspection(reports, {severity: INFO, ...opts}));
  };
};

export const getDefaultConfigValue = (rulePath, configProp) =>
  _.get(`meta.schema.properties.${configProp}.default`, require(rulePath));
