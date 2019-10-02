import {_, constants, observable} from '@report-toolkit/common';
import {toObjectFromFilepath} from '@report-toolkit/fs';
import {basename} from 'path';

import {inspectReports, toReportFromObject} from '../../src/index.js';
import {createRule} from '../../src/rule.js';

const {INFO} = constants;
const {fromAny, map} = observable;

const toRuleDefinitionFromFilepath = (extension = '.js') => observable =>
  observable.pipe(
    map(filepath => ({
      ...require(filepath),
      id: basename(filepath, extension)
    }))
  );

const fromFilepathToRuleDefinition = filepath =>
  fromAny(filepath).pipe(toRuleDefinitionFromFilepath());

export const createInspect = (ruleFilepath, config = {}) => {
  const ruleConfigs = fromFilepathToRuleDefinition(
    require.resolve(ruleFilepath)
  ).pipe(
    map(ruleDefinition =>
      createRule(ruleDefinition).toRuleConfig({
        rules: {[ruleDefinition.id]: config}
      })
    )
  );
  return (filepaths, opts = {}) => {
    const reports = fromAny(filepaths).pipe(
      // @ts-ignore
      map(require.resolve),
      toObjectFromFilepath(),
      toReportFromObject()
    );

    return ruleConfigs.pipe(inspectReports(reports, {severity: INFO, ...opts}));
  };
};

export const getDefaultConfigValue = (rulePath, configProp) =>
  _.get(`meta.schema.properties.${configProp}.default`, require(rulePath));
