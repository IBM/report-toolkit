import {_, createDebugPipe, observable} from '@report-toolkit/common';

const {map} = observable;

const debug = createDebugPipe('transformer', 'filter');

/**
 * @type {TransformerMeta}
 */
export const meta = {
  description: 'Filters properties',
  id: 'filter',
  input: ['report', 'object'],
  output: 'object'
};

/**
 * @param {FilterTransformerOptions} opts
 * @returns {TransformFunction<object,object>}
 */
export const transform = ({include = [], exclude = []} = {}) => {
  /**
   * @type {Function[]}
   */
  const filterFns = [_.identity];
  if (include.length) {
    filterFns.push(_.pick(include));
  }
  if (exclude.length) {
    filterFns.push(_.omit(exclude));
  }
  // @ts-ignore
  const filterFn = _.pipe(...filterFns);
  return observable =>
    observable.pipe(
      map(filterFn),
      debug(data => [`filtered data: %O`, data])
    );
};

/**
 * @typedef {import('@report-toolkit/common').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 * @typedef {{include?: string[], exclude?: string[]}} FilterTransformerOptions
 */

/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
