import {OPTIONS} from './common';
import _ from 'lodash/fp';
import colors from '../colors';
import {loadRules} from '../../api/stream';
import {toFormattedString} from '../console';

export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const builder = yargs => yargs.options(OPTIONS.OUTPUT);

export const handler = ({
  color,
  pretty = false,
  truncate: truncateValues = true,
  wrap: wrapValues = false,
  format = 'table'
}) => {
  loadRules()
    .pipe(
      toFormattedString(format, {
        color,
        fields: [
          {
            label: 'Rule',
            value: _.pipe(
              _.get('id'),
              colors.cyan
            )
          },
          {
            label: 'Description',
            value: _.getOr(colors.dim('(no description)'), 'description')
          }
        ],
        pretty,
        outputHeader: 'Available Rules',
        truncateValues,
        wrapValues
      })
    )
    .subscribe(console.log);
};
