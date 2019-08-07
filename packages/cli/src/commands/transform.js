import {_} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';

import {terminalColumns, toOutput} from '../console-utils.js';
import {commandConfig, fromFilepathsToReports, OPTIONS} from './common.js';

const {transform, fromTransformerChain} = stream;

const DEFAULT_TRANSFORMER = 'json';
const DEFAULT_TRANSFORM_CONFIG = {
  maxWidth: terminalColumns,
  transform: {
    table: {
      outputHeader: 'Transformation Result'
    }
  }
};

export const command = 'transform <file..>';

export const desc = 'Transform a report';

// TODO: getOptions() should probably handle all of this merging
export const builder = yargs =>
  yargs
    .positional('file', {
      coerce: _.castArray
    })
    .options({
      ...OPTIONS.OUTPUT,
      ...{
        transform: {
          ...OPTIONS.OUTPUT.transform,
          default: DEFAULT_TRANSFORMER
        }
      },
      ...OPTIONS.JSON_TRANSFORM,
      ...{
        pretty: {
          ...OPTIONS.JSON_TRANSFORM.pretty,
          default: false
        }
      },
      ...OPTIONS.FILTER_TRANSFORM,
      ...OPTIONS.TABLE_TRANSFORM
    });

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

  const config = commandConfig('transform', argv, DEFAULT_TRANSFORM_CONFIG);

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
