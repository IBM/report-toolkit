import {_, createDebugPipe, error, observable} from '@report-toolkit/common';

import * as csv from './csv.js';
import * as json from './json.js';
import * as newline from './newline.js';
import * as numeric from './numeric.js';
import * as redact from './redact.js';
import * as stackHash from './stack-hash.js';
import * as table from './table.js';
import {createTransformer, Transformer} from './transformer.js';

const {
  RTKERR_INVALID_PARAMETER,
  RTKERR_INVALID_TRANSFORMER_HEAD,
  RTKERR_INVALID_TRANSFORMER_PIPE,
  RTKERR_INVALID_TRANSFORMER_TAIL,
  RTKERR_UNKNOWN_TRANSFORMER,
  createRTkError
} = error;
const {from, iif, mergeMap, of, pipeIf, throwRTkError, toArray} = observable;
const debug = createDebugPipe('transformers');

/**
 * @type {{[key: string]: Transformer}}
 */
export const transformers = _.reduce(
  /**
   * @param {object} transformers
   * @param {{transform: TransformFunction<any,any>, meta: TransformerMeta}} transformer
   */
  (transformers, transformer) => ({
    ...transformers,
    [transformer.meta.name]: createTransformer(
      transformer.transform,
      transformer.meta
    )
  }),
  {},
  [csv, json, newline, numeric, redact, stackHash, table]
);

export {Transformer, createTransformer};

/**
 * @param {Transformer[]|string[]} transformerIds - One or more Transformer or
 * Transformer names
 * @returns {Observable<Transformer>}
 */
export const validateTransforms = transformerIds =>
  iif(
    () => Boolean(transformerIds.length),
    from(transformerIds).pipe(
      pipeIf(
        _.isString,
        mergeMap(
          /**
           * @param {string} id
           * @returns {Observable<Transformer>}
           */
          id => {
            const transformer = transformers[id];
            return iif(
              () => Boolean(transformer),
              of(transformer),
              throwRTkError(
                RTKERR_UNKNOWN_TRANSFORMER,
                `Unknown transformer "${id}"`
              )
            );
          }
        ),
        debug(
          /**
           * @param {Transformer} transformer
           */
          transformer => `found transformer ${transformer.id}`
        )
      ),
      toArray(),
      // TODO: I'd rather this not be so imperative, but I'm not sure of a decent
      // way to go about this using RxJS
      mergeMap(
        /**
         * @param {Transformer[]} transformers
         */
        transformers => {
          let idx = 0;
          let transformer = transformers[idx];
          if (!transformer.canBegin) {
            // TODO: list valid transformers (using URL?)
            throw createRTkError(
              RTKERR_INVALID_TRANSFORMER_HEAD,
              `The first transformer ("${transformer.id}") must accept a Report`
            );
          }

          let nextTransformer = transformers[++idx];
          while (nextTransformer) {
            if (!transformer.canPipeTo(nextTransformer)) {
              // TODO: list valid transformers (using URL?)
              throw createRTkError(
                RTKERR_INVALID_TRANSFORMER_PIPE,
                `Transformer "${transformer.id}" cannot pipe to transformer "${nextTransformer.id}"`
              );
            }
            transformer = nextTransformer;
            nextTransformer = transformers[++idx];
          }

          if (!transformer.canEnd) {
            // TODO: list valid transformers (using URL?)
            throw createRTkError(
              RTKERR_INVALID_TRANSFORMER_TAIL,
              `The last transformer ("${transformer.id}") must output a string`
            );
          }

          return transformers;
        }
      )
    ),
    throwRTkError(
      RTKERR_INVALID_PARAMETER,
      'Expected one or more Transformers or Transformer names'
    )
  );

/**
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 * @typedef {import('@report-toolkit/report').Report} Report
 */
/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
/**
 * @template T
 * @typedef {import('rxjs').Observable<T>} Observable
 */
/**
 * @template T,U
 * @typedef {import('rxjs/internal/types').OperatorFunction<T,U>} OperatorFunction
 */
