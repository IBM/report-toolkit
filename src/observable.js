import {
  EMPTY,
  Observable,
  bindNodeCallback,
  combineLatest,
  concat,
  defer,
  from,
  fromEvent,
  iif,
  interval,
  of,
  throwError
} from 'rxjs';
import {
  catchError,
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
  switchMapTo,
  takeUntil,
  takeWhile,
  tap,
  toArray
} from 'rxjs/operators';

import _ from 'lodash/fp';
import isPromise from 'p-is-promise';

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
 * @returns {Observable}
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
  defer(() => {
    return _.overSome([isPromise, _.isArray])(value)
      ? from(value).pipe(mergeMap(fromAny))
      : _.isUndefined(value)
      ? EMPTY
      : of(value);
  });

export {
  bindNodeCallback,
  combineLatest,
  catchError,
  concat,
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
  switchMapTo,
  takeUntil,
  takeWhile,
  tap,
  throwError,
  toArray
};
