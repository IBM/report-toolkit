import {_} from '@report-toolkit/common';
import {runTransforms, validateTransforms} from '@report-toolkit/transformers';

import {terminalColumns, toOutput} from '../console-utils.js';
import {fromFilepathToReport, OPTIONS} from './common.js';

export const command = 'transform <file..>';

export const desc = 'Transform a report';

export const builder = yargs =>
  yargs
    .positional('file', {
      coerce: _.castArray,
      normalize: true
    })
    .options({
      ...OPTIONS.OUTPUT,
      ...{
        transform: {
          ...OPTIONS.TRANSFORM.transform,
          coerce: _.castArray,
          default: 'json',
          type: 'array'
        }
      }
    });

export const handler = argv => {
  const {
    color,
    config,
    file: filepaths,
    output,
    pretty = false,
    showSecretsUnsafe = false,
    transform: transformerNames,
    truncate: truncateValues = true,
    wrap: wrapValues = false
  } = argv;

  /**
   * @type {Observable<Report>}
   */
  const reports = fromFilepathToReport(filepaths, {
    ...config.transform,
    showSecretsUnsafe
  });
  validateTransforms(transformerNames)
    .pipe(
      runTransforms(reports, config, config.transform, {
        maxWidth: terminalColumns,
        outputHeader: 'Transformation Result',
        pretty,
        truncateValues,
        wrapValues
      }),
      toOutput(output, {color})
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
