// there is probably a better way, but I don't know what it is.

import clamp from 'lodash/fp/clamp.js';
import concat from 'lodash/fp/concat.js';
import constant from 'lodash/fp/constant.js';
import curry from 'lodash/fp/curry.js';
import curryN from 'lodash/fp/curryN.js';
import defaults from 'lodash/fp/defaults.js';
import defaultsDeep from 'lodash/fp/defaultsDeep.js';
import defaultsDeepAll from 'lodash/fp/defaultsDeepAll.js';
import filter from 'lodash/fp/filter.js';
import flip from 'lodash/fp/flip.js';
import forEach from 'lodash/fp/forEach.js';
import get from 'lodash/fp/get.js';
import getOr from 'lodash/fp/getOr.js';
import gte from 'lodash/fp/gte.js';
import has from 'lodash/fp/has.js';
import identity from 'lodash/fp/identity.js';
import includes from 'lodash/fp/includes.js';
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
import map from 'lodash/fp/map.js';
import memoize from 'lodash/fp/memoize.js';
import merge from 'lodash/fp/merge.js';
import negate from 'lodash/fp/negate.js';
import noop from 'lodash/fp/noop.js';
import omit from 'lodash/fp/omit.js';
import omitBy from 'lodash/fp/omitBy.js';
import once from 'lodash/fp/once.js';
import orderBy from 'lodash/fp/orderBy.js';
import overEvery from 'lodash/fp/overEvery.js';
import overSome from 'lodash/fp/overSome.js';
import pick from 'lodash/fp/pick.js';
import pipe from 'lodash/fp/pipe.js';
import __ from 'lodash/fp/placeholder.js';
import reduce from 'lodash/fp/reduce.js';
import reverse from 'lodash/fp/reverse.js';
import size from 'lodash/fp/size.js';
import some from 'lodash/fp/some.js';
import split from 'lodash/fp/split.js';
import sum from 'lodash/fp/sum.js';
import tap from 'lodash/fp/tap.js';
import toPairs from 'lodash/fp/toPairs.js';
import trimEnd from 'lodash/fp/trimEnd.js';
import unary from 'lodash/fp/unary.js';
import uniq from 'lodash/fp/uniq.js';
import isPromise from 'p-is-promise';
import traverse from 'traverse';

export const coerceToArray = value => (isArray(value) ? value : [value]);

export const _ = {
  __,
  clamp,
  concat,
  constant,
  curry,
  curryN,
  defaults,
  defaultsDeep,
  defaultsDeepAll,
  filter,
  flip,
  forEach,
  get,
  getOr,
  gte,
  has,
  identity,
  includes,
  invokeArgs,
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
  map,
  memoize,
  merge,
  negate,
  noop,
  omit,
  omitBy,
  once,
  orderBy,
  overEvery,
  overSome,
  pick,
  pipe,
  reduce,
  reverse,
  size,
  some,
  split,
  sum,
  tap,
  toPairs,
  traverse,
  trimEnd,

  unary,
  uniq
};
