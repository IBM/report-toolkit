import {_, observable} from '@report-toolkit/common';
import {observable as observableAPI} from '@report-toolkit/core';

import {toOutput} from '../console-utils.js';
import {getOptions, mergeCommandConfig, OPTIONS} from './common.js';

const {map, share} = observable;
const {
  fromRegisteredRuleDefinitions,
  transform,
  fromTransformerChain
} = observableAPI;

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

/**
 *
 * @param {import('yargs').Argv} yargs
 */
export const builder = yargs =>
  yargs.options({
    ...getOptions(OPTIONS.OUTPUT, {sourceType: 'object'}),
    ...OPTIONS.JSON_TRANSFORM,
    ...OPTIONS.TABLE_TRANSFORM
  });

/**
 * This handler lists rules.
 * @param {CLIArguments<*>} argv - yargs' argv
 */
export const handler = argv => {
  const source = fromRegisteredRuleDefinitions().pipe(
    map(({id, meta}) => ({
      id,
      description: _.getOr('(no description)', 'docs.description', meta)
    })),
    share()
  );

  const config = mergeCommandConfig(
    'list-rules',
    argv,
    DEFAULT_LIST_RULES_CONFIG
  );
  fromTransformerChain(argv.transform, config)
    .pipe(
      transform(source, {
        beginWith: 'object',
        defaultTransformerConfig: config.transform.table
      }),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};

/**
 * @template T
 * @typedef {import('..').CLIArguments<T>} CLIArguments
 */
