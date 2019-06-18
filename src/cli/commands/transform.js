import * as transformers from '../../transformers';

import {
  FORMAT_CSV,
  FORMAT_JSON,
  FORMAT_PIPE,
  FORMAT_TABLE
} from '../../formatters';
import {GNOSTIC_ERR_INVALID_CLI_OPTION, GnosticError} from '../../error';
import {GROUPS, OPTIONS} from './common';
import {iif, tap, throwGnosticError} from '../../observable';

import _ from 'lodash/fp';
import colors from '../colors';
import {createDebugger} from '../../debug';
import {loadReport} from '../../api/stream';
import {toFormattedString} from '../console';
import {writeFileSync} from 'fs';

const debug = createDebugger(module);

const ALLOWED_FORMATS = [FORMAT_CSV, FORMAT_JSON, FORMAT_TABLE, FORMAT_PIPE];

export const command = 'transform <transformer> <file..>';

export const desc = 'Transform a report';

export const builder = yargs =>
  yargs
    .options({
      field: {
        type: 'array',
        requiresArg: true,
        description:
          'Filter on field by keypath (e.g., "javascriptHeap.totalMemory")',
        defaultDescription: '(all numeric fields)',
        group: GROUPS.FILTER
      },
      ...OPTIONS.OUTPUT,
      format: {
        choices: ALLOWED_FORMATS,
        description: 'Output format',
        group: GROUPS.OUTPUT,
        default: FORMAT_TABLE
      }
    })
    .check(argv => {
      if (!ALLOWED_FORMATS.includes(argv.format)) {
        throw GnosticError.create(
          GNOSTIC_ERR_INVALID_CLI_OPTION,
          `Invalid format "${
            argv.format
          }". Allowed formats: ${ALLOWED_FORMATS.join(', ')}`
        );
      }
      return true;
    });

export const handler = ({
  transformer,
  file: filepaths,
  field,
  color,
  format = 'json',
  pretty = false,
  truncate: truncateValues = true,
  wrap: wrapValues = false,
  output
} = {}) => {
  const operator = transformers[transformer];
  iif(
    () => operator,
    loadReport(filepaths).pipe(
      tap(() => debug(`using transformer "${transformer}"`)),
      operator({field}),
      toFormattedString(format, {
        color,
        fields: [
          {
            label: 'Keypath',
            value: _.pipe(
              _.get('key'),
              colors.cyan
            )
          },
          {
            label: 'Value',
            value: _.pipe(
              _.get('value'),
              colors.magenta
            )
          }
        ],
        pretty,
        outputHeader: 'Transformation Result',
        truncateValues,
        wrapValues
      })
    ),
    throwGnosticError(
      GNOSTIC_ERR_INVALID_CLI_OPTION,
      `Unknown transform ${transformer}`
    )
  ).subscribe(result => {
    if (output) {
      return writeFileSync(output, result);
    }
    console.log(result);
  });
};
