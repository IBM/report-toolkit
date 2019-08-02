import {_, observable} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';
import {ruleDefs} from '@report-toolkit/rules';

import {toOutput} from '../console-utils.js';
import {getOptions, OPTIONS} from './common.js';

const {from, share} = observable;
const {fromTransformers} = stream;
export const command = 'list-rules';

export const desc = 'Lists built-in rules';

export const builder = yargs =>
  yargs.options({
    ...getOptions(OPTIONS.OUTPUT, {sourceType: 'object'}),
    ...OPTIONS.JSON_TRANSFORM,
    ...OPTIONS.TABLE_TRANSFORM,
    ...OPTIONS.FILTER_TRANSFORM
  });

export const handler = argv => {
  const source = from(ruleDefs).pipe(share());
  fromTransformers(source, argv.transform, {
    beginWith: 'object',
    config: _.mergeAll([
      _.getOr({}, 'config', argv),
      {
        fields: [
          {
            label: 'Rule',
            value: 'id'
          },
          {
            label: 'Description',
            value: _.getOr('(no description)', 'description')
          }
        ],
        outputHeader: 'Available Rules'
      }
    ]),
    overrides: argv
  })
    .pipe(toOutput(argv.output, {color: argv.color}))
    .subscribe();
};
