import {_} from '@report-toolkit/common';
import {loadTransforms, runTransforms} from '@report-toolkit/transformers';

import {terminalColumns, toOutput} from '../console-utils.js';
import {fromFilepathToReport, OPTIONS} from './common.js';

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
          default: 'json'
        }
      },
      ...OPTIONS.JSON_TRANSFORM,
      ...{
        pretty: {
          ...OPTIONS.JSON_TRANSFORM.pretty,
          default: false
        }
      },
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
  loadTransforms(argv.transform)
    .pipe(
      runTransforms(
        reports,
        _.mergeAll([
          _.getOr({}, 'config', argv),
          _.getOr({}, 'config.transform', argv),
          {maxWidth: terminalColumns, outputHeader: 'Transformation Result'}
        ]),
        argv
      ),
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
 * @typedef {import('@report-toolkit/report').Report} Report
 */
