import {_, createDebugPipe, error, observable} from '@report-toolkit/common';

import * as csv from './csv.js';
import * as filter from './filter.js';
import * as json from './json.js';
import * as newline from './newline.js';
import * as numeric from './numeric.js';
import * as redact from './redact.js';
import * as stackHash from './stack-hash.js';
import * as table from './table.js';
import {createTransformer, Transformer} from './transformer.js';

const knownTransformers = [
  csv,
  filter,
  json,
  newline,
  numeric,
  redact,
  stackHash,
  table
];

const transformerModules = _.fromPairs(
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
  if (!isKnownTransformer(id)) {
    throw createRTkError(
      RTKERR_UNKNOWN_TRANSFORMER,
      `Unknown transformer "${id}"`
    );
  }
  const {meta, transform} = transformerModules[id];
  return createTransformer(
    /** @type {TransformFunction<any,any>} */ (transform),
    meta
  );
};

/**
 * @param {string} id
 */
export const isKnownTransformer = id => Boolean(transformerModules[id]);

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
 * @param {string} [opts.defaultTransformer] - Default transformer
 * @returns {Observable<Transformer>}
 */
export const loadTransforms = (
  transformerIds,
  {
    beginWith = 'report',
    endWith = 'string',
    defaultTransformer = DEFAULT_TRANSFORMER
  } = {}
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
            transformers.push(loadTransformer(defaultTransformer));
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
 * @param {Observable<any>} source
 */
export const runTransforms = (source, config = {}, opts = {}) => /**
 * @param {Observable<Transformer>} observable
 */ observable =>
  observable.pipe(
    toArray(),
    debug(
      transformers =>
        `running transform(s): ${_.map('id', transformers).join(' => ')}`
    ),
    debug(() => [`received opts %O`, opts]),
    concatMap(transformers =>
      source.pipe(
        // @ts-ignore
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

export const compatibleTransforms = sourceType =>
  _.keys(
    _.fromPairs(
      _.filter(
        ([id, transformerModule]) =>
          _.includes(sourceType, transformerModule.meta.input),
        _.toPairs(transformerModules)
      )
    )
  );

/**
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 * @typedef {import('@report-toolkit/common').Report} Report
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
