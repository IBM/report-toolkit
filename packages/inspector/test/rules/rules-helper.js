import {_, observable} from '@report-toolkit/common';
import {toObjectFromFilepath} from '@report-toolkit/fs';
import {basename} from 'path';

import {inspectReports, toReportFromObject} from '../../src/index.js';
import {createRule} from '../../src/rule.js';

const {fromAny, map} = observable;

/**
 * Loads a rule definition from a filepath
 * @param {string} extension - File extension of rule definition script
 * @returns {import('rxjs').OperatorFunction<string,import('@report-toolkit/inspector').RuleDefinition>}
 */
const toRuleDefinitionFromFilepath = (extension = '.js') => observable =>
  observable.pipe(
    map(filepath => ({
      ...require(filepath),
      id: basename(filepath, extension)
    }))
  );

/**
 *
 * @param {string} filepath - Filepath to rule definition script
 */
const fromFilepathToRuleDefinition = filepath =>
  fromAny(filepath).pipe(toRuleDefinitionFromFilepath());

/**
 * Factory to create "inspect" methods which will apply a single,
 * configured rule agains one or more reports, and emit `Message` objects.
 * @param {string} ruleFilepath  - Filepath to rule definition script
 * @param {object} [config] - Optional config to apply to rule
 */
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

  return (
    /**
     * @param {string|string[]} filepaths - One or more report filepaths
     */
    filepaths => {
      const reports = fromAny(filepaths).pipe(
        map(filepath => require.resolve(filepath)),
        toObjectFromFilepath(),
        toReportFromObject()
      );

      return ruleConfigs.pipe(inspectReports(reports));
    }
  );
};

/**
 * Returns the default value of a particular meta property of a rule definition
 * @param {string} ruleFilepath - Path to rule definition script
 * @param {string} configProp - "Meta" property to retrieve the default value of
 */
export const getDefaultConfigValue = (ruleFilepath, configProp) =>
  _.get(`meta.schema.properties.${configProp}.default`, require(ruleFilepath));
