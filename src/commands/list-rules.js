import {asFormat, asString} from '../console';

import {OPTIONS} from './common';
import _ from 'lodash/fp';
import colors from 'ansi-colors';
import {loadRules} from '../api/observable';

export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const builder = yargs => yargs.options(OPTIONS.OUTPUT);

export const handler = argv => {
  const {
    color,
    pretty = false,
    truncate: truncateValues = true,
    wrap: wrapValues = false,
    format = 'table'
  } = argv;
  loadRules()
    .pipe(
      asFormat(format, {
        color,
        fields: [
          {
            label: 'Rule',
            value: _.pipe(
              _.get('id'),
              v => colors.cyan(v)
            )
          },
          {
            label: 'Description',
            value: _.getOr(colors.dim('(no description)'), 'description')
          }
        ],
        pretty,
        title: 'Available Rules',
        truncateValues,
        wrapValues
      }),
      asString({color})
    )
    .subscribe(console.log);
};
