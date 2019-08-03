import {
  _,
  constants,
  createDebugPipe,
  observable
} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';

import {fail, ok, toOutput} from '../console-utils.js';
import {
  commandConfig,
  fromFilepathToReport,
  GROUPS,
  OPTIONS
} from './common.js';

const {ERROR, INFO, WARNING} = constants;
const {
  fromBuiltinRules,
  inspectReports,
  toRuleConfig,
  transform,
  fromTransformerChain
} = stream;
const {share} = observable;
const debug = createDebugPipe('cli', 'commands', 'inspect');

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs =>
  yargs
    .positional('file', {
      coerce: _.castArray,
      type: 'array'
    })
    .options({
      severity: {
        choices: [INFO, WARNING, ERROR],
        default: ERROR,
        description: 'Minimum severity level for messages',
        group: GROUPS.FILTER
      },
      ...OPTIONS.OUTPUT,
      ...OPTIONS.TABLE_TRANSFORM,
      ...OPTIONS.JSON_TRANSFORM,
      ...OPTIONS.FILTER_TRANSFORM
    });

export const handler = argv => {
  const {file, severity = ERROR} = argv;

  const DEFAULT_INSPECT_CONFIG = {
    inspect: {
      fields: [
        {
          label: 'File',
          value: 'filepath',
          widthPct: 30
        },
        {
          label: 'Rule',
          value: 'id',
          widthPct: 20
        },
        {
          label: 'Message',
          value: 'message',
          widthPct: 50
        }
      ]
    },
    transformer: {
      table: {
        outputFooter: t =>
          t.length
            ? fail(`Found ${t.length} issue(s) in ${file.length} file(s)`)
            : ok(`No issues found in ${file.length} file(s)`),
        outputHeader: 'diagnostic Report Inspection'
      }
    }
  };

  const config = commandConfig('inspect', argv, DEFAULT_INSPECT_CONFIG);

  const source = fromBuiltinRules().pipe(
    debug(rule => [`loading rule: %O`, rule]),
    toRuleConfig(config),
    inspectReports(fromFilepathToReport(file, config), {severity}),
    share()
  );

  fromTransformerChain(argv.transform, config)
    .pipe(
      transform(source, {beginWith: 'object'}),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};
