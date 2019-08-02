import {_} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';

import {terminalColumns, toOutput} from '../console-utils.js';
import {fromFilepathToReport, OPTIONS} from './common.js';

const {fromTransformers} = stream;
const DEFAULT_TRANSFORMER = 'json';

export const command = 'transform <file..>';

export const desc = 'Transform a report';

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
  const reports = fromFilepathToReport(
    argv.file,
    _.getOr(
      _.get('config.transform.showSecretsUnsafe', argv),
      'showSecretsUnsafe',
      argv
    )
  );
  fromTransformers(reports, argv.transform, {
    defaultTransformer: DEFAULT_TRANSFORMER,
    config: _.mergeAll([
      _.getOr({}, 'config', argv),
      _.getOr({}, 'config.transform', argv),
      {maxWidth: terminalColumns, outputHeader: 'Transformation Result'}
    ]),
    overrides: argv
  })
    .pipe(toOutput(argv.output, {color: argv.color}))
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
