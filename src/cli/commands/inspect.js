import {FORMAT_CSV, FORMAT_JSON, FORMAT_TABLE} from '../../formatters/index';
import {GROUPS, OPTIONS} from './common';
import {fail, toFormattedString} from '../console';

import _ from 'lodash/fp';
import colors from '../colors';
import {inspect} from '../../api/stream';

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs =>
  yargs
    .positional('file', {
      type: 'array',
      coerce: v => (_.isArray(v) ? v : [v])
    })
    .options({
      'show-secrets-unsafe': {
        type: 'boolean',
        description: 'Live dangerously & do not automatically redact secrets',
        group: GROUPS.OUTPUT
      },
      level: {
        choices: ['info', 'warning', 'error'],
        description: 'Errorlevel for messages',
        group: GROUPS.FILTER,
        default: 'error'
      },
      ...OPTIONS.OUTPUT
    })
    .check(argv => {
      if (![FORMAT_CSV, FORMAT_JSON, FORMAT_TABLE].includes(argv.format)) {
        throw new Error(`Invalid format "${argv.format}"`);
      }
      return true;
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
    level = 'error'
  } = argv;
  const redactSecrets = !argv['show-secrets-unsafe'];
  inspect(filepaths, {config, redactSecrets, level})
    .pipe(
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
