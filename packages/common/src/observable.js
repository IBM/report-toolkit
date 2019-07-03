import {
  bindNodeCallback,
  combineLatest,
  concat,
  defer,
  EMPTY,
  from,
  fromEvent,
  iif,
  interval,
  isObservable,
  Observable,
  of,
  throwError
} from 'rxjs';
import {
  catchError,
  concatAll,
  concatMap,
  concatMapTo,
  count,
  defaultIfEmpty,
  distinct,
  filter,
  finalize,
  first,
  map,
  mapTo,
  mergeAll,
  mergeMap,
  pluck,
  reduce,
  share,
  single,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
  takeWhile,
  tap,
  toArray
} from 'rxjs/operators/index.js';

import {GnosticError} from './error.js';
import {_, isPromise} from './util.js';

/**
 * Pipes source Observable to one or more Operators if the predicate is truthy.
 * If falsy, just returns the source Observable.
 * @param {Function|any} predicate - If a function, evaluated with the value from the source Observable. Anything else is evaluated when called.
 * @param  {...Operator} operators - One or more RxJS operators to pipe to
 * @returns {Observable}
 */
export const pipeIf = (predicate, ...operators) => {
  predicate = _.isFunction(predicate) ? predicate : _.constant(predicate);
  return observable =>
    observable.pipe(
      mergeMap(v => (predicate(v) ? of(v).pipe(...operators) : of(v)))
    );
};

/**
 * Essentially wraps `_.orderBy()`
 * @see https://lodash.com/docs/4.17.11#orderBy
 * @param {string|string[]|Function|Function[]|Object|Object[]} iteratee - Any supported LoDash iteratee or list thereof
 * @param {string|string[]} [direction=asc] - Order in which to sort (`asc` or `desc`) or list thereof, corresponding to each item in `iteratee` (if `iteratee` is a list)
 * @returns {Observable<T>} Note that returning an Array from `mergeMap` fn is handled like calling `from`, so the resulting Observable does *not* emit Arrays.
 */
export const sort = (iteratee = _.identity, direction = 'asc') => observable =>
  observable.pipe(
    toArray(),
    mergeMap(_.orderBy(iteratee, direction))
  );

/**
 * Recursively explodes any value, an Array, a Promise, a Promise of Arrays, a
 * Promise of Arrays of Promises, etc., into a single Observable.
 * Returns `EMPTY` if value is undefined.
 * @param {*} value - Probably anything
 * @returns {Observable<*|EMPTY>}
 */
export const fromAny = value =>
  defer(() =>
    _.overSome([isPromise, _.isArray])(value)
      ? from(value).pipe(mergeMap(fromAny))
      : _.isUndefined(value)
      ? EMPTY
      : of(value)
  );

export const throwGnosticError = (code, message, opts = {}) =>
  throwError(GnosticError.create(code, message, opts));

export const toObjectFromJSON = () => observable =>
  observable.pipe(map(JSON.parse));

export {
  bindNodeCallback,
  combineLatest,
  catchError,
  concat,
  concatAll,
  concatMap,
  concatMapTo,
  count,
  defer,
  defaultIfEmpty,
  distinct,
  EMPTY,
  filter,
  finalize,
  first,
  from,
  fromEvent,
  iif,
  interval,
  isObservable,
  map,
  mapTo,
  mergeAll,
  mergeMap,
  Observable,
  of,
  pluck,
  reduce,
  share,
  single,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
  takeWhile,
  tap,
  throwError,
  toArray
};
