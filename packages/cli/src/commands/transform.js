import {_, createDebugPipe, observable} from '@report-toolkit/common';
import {validateTransforms} from '@report-toolkit/transformers';
import termsize from 'term-size';

import {normalizeFields, toOutput} from '../console-utils.js';
import {fromFilepathToReport, OPTIONS} from './common.js';

const {concatMap, map, toArray} = observable;
const debug = createDebugPipe('cli', 'command', 'transform');
export const command = 'transform <file..>';

export const desc = 'Transform a report';

export const builder = yargs =>
  yargs
    .positional('file', {
      coerce: _.castArray,
      type: 'array'
    })
    .options({
      ...OPTIONS.OUTPUT,
      ...{...OPTIONS.TRANSFORM, coerce: _.castArray, required: true}
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
      // XXX: this is hacky and bad
      map(transformer =>
        Object.assign(transformer, {
          fields: normalizeFields(transformer.fields)
        })
      ),
      toArray(),
      concatMap(transformers =>
        // @ts-ignore
        reports.pipe(
          debug(() => `running transforms: ${_.map('id', transformers)}`),
          ..._.map(
            transformer =>
              transformer({
                ...config.transform,
                ..._.getOr({}, transformer.id, config),
                maxWidth: termsize().columns,
                outputHeader: 'Transformation Result',
                pretty,
                truncateValues,
                wrapValues
              }),
            transformers
          )
        )
      ),
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
