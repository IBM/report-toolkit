import {_, observable} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';
import {ruleDefs} from '@report-toolkit/rules';

import {toOutput} from '../console-utils.js';
import {commandConfig, getOptions, OPTIONS} from './common.js';

const {from, share} = observable;
const {transform, fromTransformerChain} = stream;

const DEFAULT_LIST_RULES_CONFIG = {
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
  transform: {table: {outputHeader: 'Available Rules'}}
};

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
  fromTransformerChain(
    argv.transform,
    commandConfig('list-rules', argv, DEFAULT_LIST_RULES_CONFIG)
  )
    .pipe(
      transform(source, {
        beginWith: 'object'
      }),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};
