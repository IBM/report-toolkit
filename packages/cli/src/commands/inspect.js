import {
  _,
  constants,
  createDebugPipe,
  observable
} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';
import {rules} from '@report-toolkit/rules';
import {loadTransforms, runTransforms} from '@report-toolkit/transformers';

import {fail, ok, toOutput} from '../console-utils.js';
import {fromFilepathToReport, GROUPS, OPTIONS} from './common.js';

const {ERROR, INFO, WARNING} = constants;
const {toInspection, toRuleConfig} = stream;
const {share, from} = observable;
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
      ...OPTIONS.OUTPUT
    });

export const handler = argv => {
  const {file: filepaths, severity = ERROR, config, showSecretsUnsafe} = argv;
  loadTransforms(argv.transform, {beginWith: 'object'})
    .pipe(
      runTransforms(
        from(_.map(([id, ruleDef]) => ({id, ruleDef}), _.toPairs(rules))).pipe(
          debug(rule => [`loading rule: %O`, rule]),
          toRuleConfig(config),
          toInspection(
            fromFilepathToReport(filepaths, {
              ...config.inspect,
              showSecretsUnsafe
            }),
            {severity}
          ),
          share()
        ),
        _.mergeAll([
          config,
          _.getOr({}, 'inspect', config),
          {
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
            ],
            outputFooter: t =>
              t.length
                ? fail(
                    `Found ${t.length} issue(s) in ${filepaths.length} file(s)`
                  )
                : ok(`No issues found in ${filepaths.length} file(s)`),
            outputHeader: 'diagnostic Report Inspection'
          }
        ]),
        argv
      ),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};
