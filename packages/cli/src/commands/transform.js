import {_, createDebugPipe, error, observable} from '@report-toolkit/common';
import {FORMAT_CSV, FORMAT_JSON, FORMAT_PIPE} from '@report-toolkit/formatters';
import {
  constants as transformerNames,
  transformers
} from '@report-toolkit/transformers';

import {toFormattedString, toOutput} from '../console-utils.js';
import {FORMAT_TABLE} from '../table-formatter.js';
import {fromFilepathToReport, GROUPS, OPTIONS} from './common.js';

const {iif, throwRTkError} = observable;

const {REPORT_TOOLKIT_ERR_INVALID_CLI_OPTION, createRTkError} = error;

const debug = createDebugPipe('cli', 'commands', 'transform');
const ALLOWED_FORMATS = [FORMAT_CSV, FORMAT_JSON, FORMAT_TABLE, FORMAT_PIPE];

export const command = 'transform <transformer> <file..>';

export const desc = 'Transform a report';

export const builder = yargs =>
  yargs
    .options({
      ...OPTIONS.OUTPUT,
      format: {
        choices: ALLOWED_FORMATS,
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
  let {
    color,
    config,
    file: filepaths,
    format,
    output,
    pretty = false,
    showSecretsUnsafe = false,
    transformer: transformerName,
    truncate: truncateValues = true,
    wrap: wrapValues = false
  } = argv;
  const transformer = transformers[transformerName];
  format = format || transformer.defaultFormat || FORMAT_JSON;
  // todo extract this assertion into function somewhere
  if (
    transformer.allowedFormats &&
    !_.includes(transformer.allowedFormats, format)
  ) {
    throw createRTkError(
      REPORT_TOOLKIT_ERR_INVALID_CLI_OPTION,
      // todo pluralize?
      `Format ${format} disallowed by transformer "${transformerName}". Supported formats: ${transformer.allowedFormats}`
    );
  }
  iif(
    () => transformer,
    fromFilepathToReport(filepaths, {
      ...config.transform,
      showSecretsUnsafe
    }).pipe(
      debug(() => `using transformer "${transformerName}"`),
      transformer({
        ...config.transform,
        ..._.getOr({}, `transform.${transformerName}`, config)
      }),
      toFormattedString(format, {
        color,
        fields: transformer.fields,
        outputHeader: 'Transformation Result',
        pretty,
        truncateValues,
        wrapValues
      }),
      toOutput(output)
    ),
    throwRTkError(
      REPORT_TOOLKIT_ERR_INVALID_CLI_OPTION,
      `Unknown transform ${transformerName}`
    )
  ).subscribe();
};
