import {_, createDebugPipe, error, observable} from '@report-toolkit/common';
import {FORMAT_CSV, FORMAT_JSON, FORMAT_PIPE} from '@report-toolkit/formatters';
import {
  constants as transformerNames,
  transformers
} from '@report-toolkit/transformers';
import {writeFileSync} from 'fs';

import {colors, toFormattedString} from '../console-utils.js';
import {FORMAT_TABLE} from '../table-formatter.js';
import {fromFilepathToReport, GROUPS, OPTIONS} from './common.js';

const {iif, throwRTkError} = observable;

const {REPORT_TOOLKIT_ERR_INVALID_CLI_OPTION} = error;

const debug = createDebugPipe('cli', 'commands', 'transform');
const ALLOWED_FORMATS = [FORMAT_CSV, FORMAT_JSON, FORMAT_TABLE, FORMAT_PIPE];

export const command = 'transform <transformer> <file..>';

export const desc = 'Transform a report';

export const builder = yargs =>
  yargs
    .options({
      field: {
        defaultDescription: '(all numeric fields)',
        description:
          'Filter on field by keypath (e.g., "javascriptHeap.totalMemory")',
        group: GROUPS.FILTER,
        requiresArg: true,
        type: 'array'
      },
      ...OPTIONS.OUTPUT,
      format: {
        choices: ALLOWED_FORMATS,
        default: FORMAT_TABLE,
        description: 'Output format',
        group: GROUPS.OUTPUT
      }
    })
    .positional('file', {
      coerce: _.castArray,
      type: 'array'
    })
    .positional('transform', {
      choices: Object.keys(transformerNames)
    });

export const handler = argv => {
  const {
    file: filepaths,
    transformer,
    config,
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
    fromFilepathToReport(filepaths, {
      ...config.transform,
      showSecretsUnsafe
    }).pipe(
      debug(() => `using transformer "${transformer}"`),
      transform({
        ...config.transform,
        ..._.getOr({}, `transform.${transformer}`, config)
      }),
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
        outputHeader: 'Transformation Result',
        pretty,
        truncateValues,
        wrapValues
      })
    ),
    throwRTkError(
      REPORT_TOOLKIT_ERR_INVALID_CLI_OPTION,
      `Unknown transform ${transformer}`
    )
  ).subscribe(result => {
    if (output) {
      return writeFileSync(output, result);
    }
    console.log(result);
  });
};
