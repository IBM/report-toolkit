import {_, createDebugPipe, error, observable} from '@gnostic/common';
import {FORMAT_CSV, FORMAT_JSON, FORMAT_PIPE} from '@gnostic/formatters';
import {toObjectFromFilepath} from '@gnostic/fs';
import {TRANSFORMER_NUMERIC, transformers} from '@gnostic/transformers';
import {writeFileSync} from 'fs';

import {colors, toFormattedString} from '../console-utils.js';
import {FORMAT_TABLE} from '../table-formatter.js';
import {GROUPS, OPTIONS} from './common.js';

const {fromAny, iif, throwGnosticError} = observable;
const {GNOSTIC_ERR_INVALID_CLI_OPTION} = error;

const debug = createDebugPipe('cli', 'commands', 'transform');

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
    .positional('file', {
      type: 'array',
      coerce: v => (_.isArray(v) ? v : [v])
    })
    .positional('transform', {
      choices: TRANSFORMER_NUMERIC
    });

export const handler = argv => {
  const {
    file: filepaths,
    transformer,
    config,
    field,
    truncate: truncateValues = true,
    wrap: wrapValues = false,
    format = FORMAT_JSON,
    pretty = false,
    color,
    output,
    showSecretsUnsafe = false
  } = argv;
  const transform = transformers[transformer];
  iif(
    () => transform,
    fromAny(filepaths).pipe(
      toObjectFromFilepath({...config.transform, showSecretsUnsafe}),
      debug(transformer => `using transformer "${transformer}"`),
      transform({...config.transform, field}),
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
