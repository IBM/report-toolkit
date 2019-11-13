// there is probably a better way, but I don't know what it is.

import castArray from 'lodash/fp/castArray.js';
import clamp from 'lodash/fp/clamp.js';
import compact from 'lodash/fp/compact.js';
import concat from 'lodash/fp/concat.js';
import constant from 'lodash/fp/constant.js';
import curry from 'lodash/fp/curry.js';
import curryN from 'lodash/fp/curryN.js';
import defaults from 'lodash/fp/defaults.js';
import defaultsDeep from 'lodash/fp/defaultsDeep.js';
import defaultsDeepAll from 'lodash/fp/defaultsDeepAll.js';
import every from 'lodash/fp/every.js';
import filter from 'lodash/fp/filter.js';
import flatMap from 'lodash/fp/flatMap.js';
import flip from 'lodash/fp/flip.js';
import forEach from 'lodash/fp/forEach.js';
import fromPairs from 'lodash/fp/fromPairs.js';
import get from 'lodash/fp/get.js';
import getOr from 'lodash/fp/getOr.js';
import gte from 'lodash/fp/gte.js';
import has from 'lodash/fp/has.js';
import identity from 'lodash/fp/identity.js';
import includes from 'lodash/fp/includes.js';
import intersection from 'lodash/fp/intersection.js';
import invokeArgs from 'lodash/fp/invokeArgs.js';
import isArray from 'lodash/fp/isArray.js';
import isBoolean from 'lodash/fp/isBoolean.js';
import isEmpty from 'lodash/fp/isEmpty.js';
import isError from 'lodash/fp/isError.js';
import isFunction from 'lodash/fp/isFunction.js';
import isNaN from 'lodash/fp/isNaN.js';
import isObject from 'lodash/fp/isObject.js';
import isString from 'lodash/fp/isString.js';
import isUndefined from 'lodash/fp/isUndefined.js';
import join from 'lodash/fp/join.js';
import keys from 'lodash/fp/keys.js';
import lowerCase from 'lodash/fp/lowerCase.js';
import map from 'lodash/fp/map.js';
import mapKeys from 'lodash/fp/mapKeys.js';
import memoize from 'lodash/fp/memoize.js';
import merge from 'lodash/fp/merge.js';
import mergeAll from 'lodash/fp/mergeAll.js';
import negate from 'lodash/fp/negate.js';
import noop from 'lodash/fp/noop.js';
import omit from 'lodash/fp/omit.js';
import omitBy from 'lodash/fp/omitBy.js';
import once from 'lodash/fp/once.js';
import orderBy from 'lodash/fp/orderBy.js';
import overEvery from 'lodash/fp/overEvery.js';
import overSome from 'lodash/fp/overSome.js';
import pick from 'lodash/fp/pick.js';
import pickBy from 'lodash/fp/pickBy.js';
import pipe from 'lodash/fp/pipe.js';
import __ from 'lodash/fp/placeholder.js';
import pull from 'lodash/fp/pull.js';
import reduce from 'lodash/fp/reduce.js';
import reverse from 'lodash/fp/reverse.js';
import size from 'lodash/fp/size.js';
import some from 'lodash/fp/some.js';
import split from 'lodash/fp/split.js';
import startsWith from 'lodash/fp/startsWith.js';
import sum from 'lodash/fp/sum.js';
import tap from 'lodash/fp/tap.js';
import toPairs from 'lodash/fp/toPairs.js';
import toUpper from 'lodash/fp/toUpper.js';
import trim from 'lodash/fp/trim.js';
import unary from 'lodash/fp/unary.js';
import uniq from 'lodash/fp/uniq.js';
import values from 'lodash/fp/values.js';
import isPromise from 'p-is-promise';
import traverse from 'traverse';

/**
 * @param {object} arg - Object to turn into a map
 * @returns {Map<string,any>}
 */
const toMap = pipe(
  toPairs,
  pairs => new Map(pairs)
);

/**
 * @param {object} arg - Object to turn into a frozen map
 */
const toFrozenMap = pipe(
  toMap,
  /**
   * @param {Map<string,any>} map
   */ map => Object.freeze(map)
);

export const _ = {
  __,
  castArray,
  clamp,
  compact,
  concat,
  constant,
  curry,
  curryN,
  defaults,
  defaultsDeep,
  defaultsDeepAll,
  every,
  filter,
  flatMap,
  flip,
  forEach,
  fromPairs,
  get,
  getOr,
  gte,
  has,
  identity,
  includes,
  invokeArgs,
  intersection,
  isArray,
  isBoolean,
  isEmpty,
  isError,
  isFunction,
  isNaN,
  isObject,
  isPromise,
  isString,
  isUndefined,
  join,
  keys,
  lowerCase,
  map,
  mapKeys,
  memoize,
  merge,
  mergeAll,
  negate,
  noop,
  omit,
  omitBy,
  once,
  orderBy,
  overEvery,
  overSome,
  pick,
  pickBy,
  pipe,
  pull,
  reduce,
  reverse,
  size,
  some,
  split,
  startsWith,
  sum,
  tap,
  toFrozenMap,
  toMap,
  toPairs,
  toUpper,
  traverse,
  trim,
  unary,
  uniq,
  values
};
