import {_, observable} from '@report-toolkit/common';
import {observable as observableAPI} from '@report-toolkit/core';

import {toOutput} from '../console-utils.js';
import {getTransformerOptions, mergeCommandConfig, OPTIONS} from './common.js';

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
  transformers: {
    table: {
      outputHeader: 'Available Rules',
      colWidths: [20, 60],
      truncate: false
    }
  }
};

export const command = 'list-rules';

export const desc = 'Lists built-in rules';

// @ts-ignore
export const builder = yargs =>
  yargs.options({
    ..._.omit(['show-secrets-unsafe'], OPTIONS.OUTPUT),
    ...getTransformerOptions({sourceType: 'object'})
  });

// @ts-ignore
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
        defaultTransformerConfig: config.transformers.table
      }),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};

/**
 * @template T
 * @typedef {import('..').CLIArguments<T>} CLIArguments
 */
