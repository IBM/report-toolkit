import * as transformers from '../../transformers';

import {GROUPS, OPTIONS} from './common';

import _ from 'lodash/fp';
import colors from '../colors';
import {loadReport} from '../../api/stream';
import {toFormattedString} from '../console';
import {writeFileSync} from 'fs';

export const command = 'transform <transformer> <file..>';

export const desc = 'Transform a report';

export const builder = yargs =>
  yargs.options({
    field: {
      type: 'array',
      requiresArg: true,
      description:
        'Filter on field by keypath (e.g., "javascriptHeap.totalMemory")',
      defaultDescription: '(all numeric fields)',
      group: GROUPS.FILTER
    },
    ...OPTIONS.OUTPUT
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
  loadReport(filepaths)
    .pipe(operator({field}))
    .pipe(
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
    )
    .subscribe(result => {
      if (output) {
        return writeFileSync(output, result);
      }
      console.log(result);
    });
};
