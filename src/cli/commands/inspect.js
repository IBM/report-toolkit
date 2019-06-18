import {ERROR, INFO, WARNING} from '../../constants';
import {FORMAT_CSV, FORMAT_JSON, FORMAT_TABLE} from '../../formatters/index';
import {GNOSTIC_ERR_INVALID_CLI_OPTION, GnosticError} from '../../error';
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
      severity: {
        choices: [INFO, WARNING, ERROR],
        description: 'Minimum severity level for messages',
        group: GROUPS.FILTER,
        default: ERROR
      },
      ...OPTIONS.OUTPUT
    })
    .check(argv => {
      if (![FORMAT_CSV, FORMAT_JSON, FORMAT_TABLE].includes(argv.format)) {
        throw GnosticError.create(
          GNOSTIC_ERR_INVALID_CLI_OPTION,
          `Invalid format "${argv.format}". Allowed formats: ${[
            FORMAT_CSV,
            FORMAT_JSON,
            FORMAT_TABLE
          ].join(', ')}`
        );
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
    severity = 'error'
  } = argv;
  const redactSecrets = !argv['show-secrets-unsafe'];
  inspect(filepaths, {config, redactSecrets, severity})
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
