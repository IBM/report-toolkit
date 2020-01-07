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

import {createRTkError} from './error.js';
import {_} from './util.js';

/**
 * Pipes source Observable to one or more Operators if the predicate is truthy.
 * If falsy, just returns the source Observable.
 * @param {Function|any} predicate - If a function, evaluated with the value from the source Observable. Anything else is evaluated when called.
 * @param {...import('rxjs').OperatorFunction<any,any>} operators - More RxJS operators to pipe to
 * @returns {import('rxjs').OperatorFunction<any,any>}
 */
export const pipeIf = (predicate, ...operators) => {
  predicate = _.isFunction(predicate) ? predicate : _.constant(predicate);
  return observable =>
    observable.pipe(
      // @ts-ignore
      mergeMap(v => (predicate(v) ? of(v).pipe(...operators) : of(v)))
    );
};

/**
 * Essentially wraps `_.orderBy()`
 * @see https://lodash.com/docs/4.17.11#orderBy
 * @param {import('lodash').List<any>} iteratee - Any supported LoDash iteratee or list thereof
 * @param {import('lodash').Many<boolean|"asc"|"desc">} [direction=asc] - Order in which to sort (`asc` or `desc`) or list thereof, corresponding to each item in `iteratee` (if `iteratee` is a list)
 * @returns {import('rxjs').OperatorFunction<any,any>}
 */
export const sort = (iteratee = _.identity, direction = 'asc') => observable =>
  observable.pipe(toArray(), mergeMap(_.orderBy(iteratee, direction)));

/**
 * Recursively explodes any value, an Array, a Promise, a Promise of Arrays, a
 * Promise of Arrays of Promises, etc., into a single Observable.
 * If the value is an Observable, returns the value.
 * Returns `EMPTY` if value is undefined.
 * @todo This can probably be done more efficiently using a loop?
 * @param {any} value - Probably anything
 * @returns {Observable<any>}
 */
export const fromAny = value =>
  isObservable(value)
    ? value
    : defer(() =>
        _.overSome([_.isPromise, _.isArray])(value)
          ? from(value).pipe(concatMap(fromAny))
          : _.isUndefined(value)
          ? EMPTY
          : of(value)
      );

/**
 * Creates an Observable that emits an RTkError
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} [opts] - Extra info
 * @param {*} [opts.data] - Extra data
 * @param {string} [opts.url] - URL for more info
 * @returns {Observable<never>} An Observable emitting a single error
 */
export const throwRTkError = (code, message, opts = {}) =>
  throwError(createRTkError(code, message, opts));

/**
 * A simple operator that parses a JSON string into the resulting JS representation.
 * @returns {import('rxjs').OperatorFunction<string,any>}
 */
export const toObjectFromJSON = () => observable =>
  observable.pipe(map(_.unary(JSON.parse)));

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
