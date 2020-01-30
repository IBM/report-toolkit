import {_, createDebugPipe, error, observable} from '@report-toolkit/common';

import * as csv from './csv.js';
import * as filter from './filter.js';
import * as json from './json.js';
import * as newline from './newline.js';
import * as redact from './redact.js';
import * as stackHash from './stack-hash.js';
import * as table from './table.js';
import {createTransformer, Transformer} from './transformer.js';

const builtinTransformers = [
  csv,
  filter,
  json,
  newline,
  redact,
  stackHash,
  table
];

const transformerModules = _.fromPairs(
  _.map(transformer => [transformer.meta.id, transformer], builtinTransformers)
);

const DEFAULT_TRANSFORMER = 'table';
const {
  RTKERR_INVALID_TRANSFORMER_HEAD,
  RTKERR_UNKNOWN_TRANSFORMER,
  createRTkError
} = error;
const {
  concatMap,
  map,
  mergeAll,
  pipeIf,
  share,
  switchMap,
  tap,
  toArray,
  throwRTkError
} = observable;
const debug = createDebugPipe('transformers');
/**
 * @type {Readonly<string[]>}
 */
export const builtinTransformerIds = Object.freeze(
  _.map('meta.id', builtinTransformers)
);

/**
 * @param {string} id - Transformer ID
 * @param {object} [config] - Configuration
 */
export const loadTransformer = (id, config = {}) => {
  if (!isKnownTransformer(id)) {
    throw createRTkError(
      RTKERR_UNKNOWN_TRANSFORMER,
      `Unknown transformer "${id}"`
    );
  }
  const {meta, transform} = transformerModules[id];
  return createTransformer(
    /** @type {TransformFunction<any,any>} */ (transform),
    meta,
    config
  );
};

/**
 * @param {string} id
 */
export const isKnownTransformer = id => Boolean(transformerModules[id]);

export {Transformer};

/**
 * @returns {OperatorFunction<TransformerConfig,Transformer>}
 */
export const toTransformer = () => observable =>
  observable.pipe(
    pipeIf(
      ({id}) => !isKnownTransformer(id),
      switchMap(({id}) =>
        throwRTkError(RTKERR_UNKNOWN_TRANSFORMER, `Unknown transformer "${id}"`)
      )
    ),
    map(({id, config}) => loadTransformer(id, config))
  );

/**
 *
 * @param {Partial<TransformOptions>} [opts]
 * @returns {OperatorFunction<Transformer,Transformer>}
 */
export const validateTransformerChain = ({
  beginWith = 'report',
  endWith = 'string',
  defaultTransformer = DEFAULT_TRANSFORMER,
  defaultTransformerConfig = {}
} = {}) => observable =>
  observable.pipe(
    toArray(),
    debug(transformers => [
      `validating chain of transformers: %O`,
      _.map('id', transformers)
    ]),
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
          transformers.push(
            loadTransformer(defaultTransformer, defaultTransformerConfig)
          );
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
  );

/**
 * @param {Observable<any>} source
 */
export const runTransformer = source => /**
 * @param {Observable<Transformer>} observable
 */ observable =>
  observable.pipe(
    toArray(),
    debug(
      transformers =>
        `running transform(s): ${_.map('id', transformers).join(' => ')}`
    ),
    concatMap(transformers =>
      // @ts-ignore
      source.pipe(
        share(),
        ..._.map(transformer => transformer.transform(), transformers)
      )
    )
  );

export const compatibleTransforms = sourceType =>
  _.keys(
    _.fromPairs(
      _.filter(
        ([, transformerModule]) =>
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
 * @typedef {import('@report-toolkit/common/src/observable').Observable<T>} Observable
 */
/**
 * @template T,U
 * @typedef {import('rxjs').OperatorFunction<T,U>} OperatorFunction
 */
/**
 * @typedef {{id: string, config: object}} TransformerConfig
 */

/**
 * for {@link validateTransformerChain}
 * @typedef {object} TransformOptions
 * @property {string} beginWith - Begin transformer chain with this type
 * @property {string} endWith - End transformer chain with this type
 * @property {string} defaultTransformer - Default transformer
 * @property {object} defaultTransformerConfig - Default transformer config
 */
