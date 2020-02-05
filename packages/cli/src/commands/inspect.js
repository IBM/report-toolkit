import {_, constants, observable} from '@report-toolkit/common';
import {observable as core} from '@report-toolkit/core';

import {terminalColumns, toOutput} from '../console-utils.js';
import {
  fromFilepathsToReports,
  GROUPS,
  mergeCommandConfig,
  OPTIONS,
  getTransformerOptions
} from './common.js';

const {ERROR, WARNING, INFO, DEFAULT_SEVERITY} = constants;
const {inspect, transform, fromTransformerChain} = core;
const {filter, take} = observable;

const DEFAULT_INSPECT_CONFIG = {
  transformer: {
    table: {
      colWidths: [12, 20, 15],
      fields: [
        {
          color: ({severity}) => SEVERITY_COLOR_MAP.get(severity),
          label: 'Severity',
          value: ({severity}) => _.toUpper(severity)
        },
        {
          label: 'File',
          value: 'filepath'
        },
        {
          label: 'Rule',
          value: 'id'
        },
        {
          label: 'Message',
          value: 'message'
        }
      ],
      maxWidth: terminalColumns,
      outputHeader: 'Diagnostic Report Inspection'
    }
  }
};

const SEVERITY_COLOR_MAP = _.toFrozenMap({
  error: 'red',
  warning: 'yellow',
  info: 'blue'
});

export const command = 'inspect <file..>';

export const desc = 'Inspect Diagnostic Report file(s) for problems';

export const builder = yargs =>
  yargs
    .positional('file', {
      coerce: _.castArray,
      type: 'array'
    })
    .options({
      severity: {
        choices: [ERROR, WARNING, INFO],
        default: DEFAULT_SEVERITY,
        description: 'Minimum threshold for message severity',
        group: GROUPS.FILTER
      },
      ...OPTIONS.OUTPUT,
      ...getTransformerOptions({sourceType: 'object'})
    });

export const handler = argv => {
  const config = mergeCommandConfig('inspect', argv, DEFAULT_INSPECT_CONFIG);
  const {file, severity, output, transform: transformer, color} = config;

  const source = inspect(fromFilepathsToReports(file, config), {
    ruleConfig: config.rules,
    severity
  });

  // if any of the messages have a severity of `error`, then
  // exit with code 1.
  source
    .pipe(
      filter(({severity}) => severity === ERROR),
      take(1)
    )
    .subscribe(() => {
      process.exitCode = 1;
    });

  fromTransformerChain(transformer, config)
    .pipe(
      transform(source, {
        beginWith: 'object',
        defaultTransformerConfig: config.transformer.table
      }),
      toOutput(output, {color})
    )
    .subscribe();
};
