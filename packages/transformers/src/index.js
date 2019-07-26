import {_, createDebugPipe, error, observable} from '@report-toolkit/common';

import * as csv from './csv.js';
import * as json from './json.js';
import * as newline from './newline.js';
import * as numeric from './numeric.js';
import * as redact from './redact.js';
import * as stackHash from './stack-hash.js';
import * as table from './table.js';
import {createTransformer, Transformer} from './transformer.js';

const knownTransformers = [
  csv,
  json,
  newline,
  numeric,
  redact,
  stackHash,
  table
];

const transformerModules = new Map(
  _.map(transformer => [transformer.meta.id, transformer], knownTransformers)
);
const transformerInstances = new Map();
const DEFAULT_TRANSFORMER = 'table';
const {
  RTKERR_INVALID_PARAMETER,
  RTKERR_INVALID_TRANSFORMER_HEAD,
  RTKERR_UNKNOWN_TRANSFORMER,
  createRTkError
} = error;
const {
  concatMap,
  from,
  iif,
  mergeAll,
  mergeMap,
  of,
  pipeIf,
  tap,
  throwRTkError,
  toArray
} = observable;
const debug = createDebugPipe('transformers');

export const knownTransformerIds = _.map('meta.id', knownTransformers);

/**
 * @param {string} id
 */
export const loadTransformer = id => {
  if (transformerInstances.has(id)) {
    return transformerInstances.get(id);
  }
  const {meta, transform} = transformerModules.get(id);
  return createTransformer(
    /** @type {TransformFunction<any,any>} */ (transform),
    meta
  );
};

/**
 * @param {string} id
 */
export const isKnownTransformer = id => transformerModules.has(id);

export {Transformer};

/**
 * Validate an array of transforms and answer whether or not it represents a
 * valid pipe. Use the options to customize the transform pipe for use by other
 * commands (e.g., `inspect` and `diff`) which might start with something other
 * than a Report.
 * @param {Transformer[]|string[]} transformerIds - One or more Transformer or
 * Transformer names
 * @param {Object} [opts] - Options
 * @param {string} [opts.beginWith=report] - Begin transform pipe with this type
 * @param {string} [opts.endWith=string] - End transform pipe with this type
 * @returns {Observable<Transformer>}
 */
export const loadTransforms = (
  transformerIds,
  {beginWith = 'report', endWith = 'string'} = {}
) =>
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
          id =>
            iif(
              () => isKnownTransformer(id),
              of(loadTransformer(id)),
              throwRTkError(
                RTKERR_UNKNOWN_TRANSFORMER,
                `Unknown transformer "${id}"`
              )
            )
        ),
        debug(
          /**
           * @param {Transformer} transformer
           */
          transformer => `found transformer "${transformer.id}"`
        )
      ),
      toArray(),
      // TODO: I'd rather this not be so imperative, but I'm not sure of a decent
      // way to go about this using RxJS
      tap(
        /**
         * @param {Transformer[]} transformers
         */
        transformers => {
          let idx = 0;
          let transformer = transformers[idx];
          if (!transformer.canBeginWith(beginWith)) {
            // TODO: list valid transformers (using URL?)
            throw createRTkError(
              RTKERR_INVALID_TRANSFORMER_HEAD,
              `The first transformer ("${transformer.id}") must accept a "${beginWith}"`
            );
          }

          if (!transformers[transformers.length - 1].canEndWith(endWith)) {
            transformers.push(loadTransformer(DEFAULT_TRANSFORMER));
          }

          let nextTransformer = transformers[++idx];
          while (nextTransformer) {
            transformer = transformer.pipe(nextTransformer);
            nextTransformer = transformers[++idx];
          }

          return transformers;
        }
      ),
      debug(
        transformers =>
          `transformer pipe {${beginWith}} => ${_.map('id', transformers).join(
            ' => '
          )} => {${endWith}} OK`
      ),
      mergeAll()
    ),
    throwRTkError(
      RTKERR_INVALID_PARAMETER,
      'Expected one or more Transformers or Transformer names'
    )
  );
/**
 * @param {Observable<Report>} source
 */
export const runTransforms = (source, config = {}, opts = {}) => /**
 * @param {Observable<Transformer>} observable
 */ observable =>
  observable.pipe(
    toArray(),
    concatMap(transformers =>
      // @ts-ignore
      source.pipe(
        debug(
          () => `running transforms: ${_.map('id', transformers).join(' => ')}`
        ),
        ..._.map(
          transformer =>
            transformer.transform(
              _.mergeAll([
                config,
                _.getOr({}, `transformers.${transformer.id}`, config),
                opts
              ])
            ),
          transformers
        )
      )
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
