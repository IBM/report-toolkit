import {_, constants, observable} from '@gnostic/common';
import {stream} from '@gnostic/core';
import {
  fromSearchpathToRuleDefinition,
  toObjectFromFilepath
} from '@gnostic/fs';
import {join} from 'path';
import resolvePkg from 'resolve-pkg';

import {colors, fail, toFormattedString} from '../console-utils.js';
import {GROUPS, OPTIONS} from './common.js';

const {ERROR, INFO, WARNING} = constants;
const {fromAny} = observable;
const {toInspection, toReportFromObject, toRuleConfig} = stream;

const BUILTIN_RULES_DIR = join(
  resolvePkg('@gnostic/rules', {cwd: __dirname}),
  'src'
);

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs =>
  yargs
    .positional('file', {
      type: 'array',
      coerce: v => (_.isArray(v) ? v : [v])
    })
    .options({
      severity: {
        choices: [INFO, WARNING, ERROR],
        description: 'Minimum severity level for messages',
        group: GROUPS.FILTER,
        default: ERROR
      },
      ...OPTIONS.OUTPUT
    });

export const handler = argv => {
  const {
    file: filepaths,
    config,
    truncate: truncateValues = true,
    wrap: wrapValues = false,
    format = 'table',
    pretty = false,
    color,
    severity = ERROR,
    showSecretsUnsafe = false
  } = argv;
  const reports = fromAny(filepaths).pipe(
    toObjectFromFilepath({...config.inspect}),
    toReportFromObject({...config.inspect, showSecretsUnsafe})
  );
  fromSearchpathToRuleDefinition(BUILTIN_RULES_DIR)
    .pipe(
      toRuleConfig(config),
      toInspection(reports, {severity}),
      toFormattedString(format, {
        color,
        fields: [
          {
            label: 'File',
            value: _.pipe(
              _.get('filepath'),
              colors.cyan
            ),
            widthPct: 30
          },
          {
            label: 'Rule',
            value: _.pipe(
              _.get('id'),
              colors.magenta
            ),
            widthPct: 20
          },
          {
            label: 'Message',
            value: _.get('message'),
            widthPct: 50
          }
        ],
        pretty,
        truncateValues,
        wrapValues,
        outputHeader: 'Diagnostic Report Inspection',
        outputFooter: t =>
          fail(`Found ${t.length} issue(s) in ${filepaths.length} file(s)`)
      })
    )
    .subscribe(console.log);
};
