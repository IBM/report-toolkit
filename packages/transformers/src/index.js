import {
  _,
  colors,
  createDebugPipe,
  error,
  observable
} from '@report-toolkit/common';

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

const {
  RTKERR_INVALID_PARAMETER,
  RTKERR_INVALID_TRANSFORMER_HEAD,
  RTKERR_INVALID_TRANSFORMER_PIPE,
  RTKERR_INVALID_TRANSFORMER_TAIL,
  RTKERR_UNKNOWN_TRANSFORMER,
  createRTkError
} = error;
const {
  concatMap,
  from,
  iif,
  map,
  mergeAll,
  mergeMap,
  of,
  pipeIf,
  throwRTkError,
  toArray
} = observable;
const debug = createDebugPipe('transformers');
const FIELD_COLORS = Object.freeze(['cyan', 'magenta', 'blue', 'green']);

const normalizeFields = _.pipe(
  _.toPairs,
  _.map(
    /**
     * @param {[number, import('packages/transformers/src/transformer').Field]} value
     */
    ([idx, field]) => {
      // a field can have a string `color`, no `color`, or a function which accepts a `row` and returns a string.
      // likewise, it can have a `value` function which accepts a `row` and returns a value, or just a string, which
      // corresponds to a property of the `row` object.
      const fieldColor = field.color || FIELD_COLORS[idx % FIELD_COLORS.length];
      const colorFn = _.isFunction(fieldColor)
        ? (row, value) => {
            // the function might not return a color
            const color =
              colors[fieldColor(row)] ||
              FIELD_COLORS[idx % FIELD_COLORS.length];
            return colors[color](value);
          }
        : (row, value) => colors[/** @type {string} */ (fieldColor)](value);
      const valueFn = _.isFunction(field.value)
        ? row => {
            // yuck
            const fn =
              /**
               * @type {function(typeof row): string}
               */ (field.value);
            return fn(row);
          }
        : _.get(field.value);
      return {
        ...field,
        value: row => colorFn(row, valueFn(row))
      };
    }
  )
);

export const knownTransformerIds = _.map('meta.id', knownTransformers);

/**
 * @param {string} id
 */
export const loadTransformer = (id, opts = {}) => {
  if (transformerInstances.has(id)) {
    return transformerInstances.get(id);
  }
  const {meta, transform} = transformerModules.get(id);
  return createTransformer(
    /** @type {TransformFunction<any,any>} */ (transform),
    _.merge(meta, opts)
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
export const validateTransforms = (
  transformerIds,
  {beginWith = 'report', endWith = 'string'} = {},
  transformerOpts = {}
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
              of(loadTransformer(id, transformerOpts[id])),
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
      map(
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

          if (!transformer.canEndWith(endWith)) {
            transformers.push(loadTransformer('table'));
            // // TODO: list valid transformers (using URL?)
            // throw createRTkError(
            //   RTKERR_INVALID_TRANSFORMER_TAIL,
            //   `The last transformer ("${transformer.id}") must output a string`
            // );
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
      // map(transformer =>
      //   Object.assign(transformer, {
      //     fields: normalizeFields(transformer.fields)
      //   })
      // )
    ),
    throwRTkError(
      RTKERR_INVALID_PARAMETER,
      'Expected one or more Transformers or Transformer names'
    )
  );

export const runTransforms = (
  source,
  config = {},
  commandConfig = {},
  opts = {}
) => observable =>
  observable.pipe(
    toArray(),
    concatMap(transformers =>
      source.pipe(
        debug(
          () => `running transforms: ${_.map('id', transformers).join(' => ')}`
        ),
        ..._.map(
          transformer =>
            transformer({
              ...commandConfig,
              ..._.getOr({}, transformer.id, config),
              ...opts
            }),
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
