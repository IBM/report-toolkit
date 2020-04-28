import {_, createDebugger} from '@report-toolkit/common';
import {observable} from '@report-toolkit/core';

import {toOutput} from '../console-utils.js';
import {
  fromFilepathsToReports,
  mergeCommandConfig,
  OPTIONS,
  getTransformerOptions
} from './common.js';

const {transform, fromTransformerChain} = observable;

const DEFAULT_TRANSFORMER = 'json';

// in the case that `table` is chosen, use this output header.
const DEFAULT_TRANSFORM_CONFIG = {
  transform: {
    table: {
      outputHeader: 'Transformation Result'
    }
  }
};

const debug = createDebugger('cli', 'commands', 'transform');

export const command = 'transform <file..>';

export const desc = 'Transform a report';

// @ts-ignore
export const builder = yargs =>
  yargs
    .positional('file', {
      coerce: _.castArray,
      type: 'string',
      nargs: 1
    })
    .options({
      ...OPTIONS.OUTPUT,
      ...getTransformerOptions({
        sourceType: 'report',
        defaultTransformer: DEFAULT_TRANSFORMER
      })
    });

// @ts-ignore
export const handler = argv => {
  /**
   * @type {Observable<Report>}
   */
  const source = fromFilepathsToReports(
    argv.file,
    _.getOr(
      _.get('config.transform.showSecretsUnsafe', argv),
      'showSecretsUnsafe',
      argv
    )
  );

  const config = mergeCommandConfig(
    'transform',
    argv,
    DEFAULT_TRANSFORM_CONFIG
  );
  debug('complete command config: %O', config);
  fromTransformerChain(argv.transform, config)
    .pipe(
      transform(source, {defaultTransformer: DEFAULT_TRANSFORMER}),
      toOutput(argv.output, {color: argv.color})
    )
    .subscribe();
};

/**
 * @template T,U
 * @typedef {import('@report-toolkit/transformers').Transformer<T,U>} Transformer
 */
/**
 * @template T
 * @typedef {import('rxjs').Observable<T>} Observable
 */
/**
 * @typedef {import('@report-toolkit/common').Report} Report
 */
